"""Deterministic, review-only GGX-inspired copper illumination for ANEVUM.

Open-source, stdlib-only. This models a microfacet conductor with two soft
studio lights and bounded ambient reflections. It is not path tracing, an
HDRI environment solver, measured copper reflectance, or full production PBR.
Colors returned as OpenCV BGR bytes. No network or production behavior.
"""
import math

PI = math.pi
F0 = (0.70, 0.40, 0.18)  # RGB copper-like reflectance, linear-space approximation
LIGHTS = (
    ((-0.34, 0.72, 0.64), (1.0, 0.77, 0.56), 3.5),
    ((0.78, 0.20, 0.59), (0.33, 0.55, 1.0), 1.4),
)


def norm(v):
    d = math.sqrt(sum(x*x for x in v))
    return tuple(x / d for x in v) if d > 1e-12 else (0.0, 0.0, 1.0)


def dot(a, b):
    return sum(x*y for x, y in zip(a, b))


def ggx_distribution(nh, roughness):
    a2 = max(0.03, roughness * roughness) ** 2
    den = nh * nh * (a2 - 1.0) + 1.0
    return a2 / max(1e-8, PI * den * den)


def smith_visibility(nv, nl, roughness):
    # Schlick-GGX with bounded denominators. Clamp before division.
    k = ((roughness + 1.0) ** 2) / 8.0
    return (nv / max(1e-5, nv*(1.0-k)+k)) * (nl / max(1e-5, nl*(1.0-k)+k))


def fresnel_schlick(cos_theta):
    t = (1.0-max(0.0,min(1.0,cos_theta))) ** 5
    return tuple(f+(1-f)*t for f in F0)


def tone(v):
    # Soft filmic shoulder plus approximate sRGB transfer.
    v = max(0.0, v)
    value = (v * (2.51*v+0.03)) / max(1e-8, (v*(2.43*v+0.59)+0.14))
    value = max(0.0, min(1.0, value))
    return 12.92*value if value < 0.0031308 else 1.055*(value**(1.0/2.4))-0.055


def copper_bgr(normal, angle, shade_band, ring_i, roughness=0.27):
    """GGX-style bounded metal response and warm/cool room-reflection terms."""
    if not all(math.isfinite(float(v)) for v in (*normal, angle, shade_band, roughness)):
        raise ValueError('non-finite metal input')
    n = norm(tuple(float(v) for v in normal))
    view = (0.0,0.0,1.0)
    if dot(n,view) < 0.0:
        n = tuple(-v for v in n)  # thin double-sided bands
    nv = max(0.03, dot(n,view))
    roughness = min(0.75,max(0.15,roughness))
    # Darker face-on copper, bright grazing edges and reflected room strips.
    ambient = 0.16 + 0.10*(1.0-nv)**2
    reflected = [F0[i]*ambient for i in range(3)]
    for vec,rgb,strength in LIGHTS:
        light = norm(vec)
        nl = max(0.0,dot(n,light))
        if nl <= 0.0:
            continue
        half = norm(tuple(light[j]+view[j] for j in range(3)))
        nh = max(0.0,dot(n,half))
        vh = max(0.0,dot(view,half))
        d = ggx_distribution(nh,roughness)
        g = smith_visibility(nv,nl,roughness)
        f = fresnel_schlick(vh)
        microfacet = min(4.0, d*g*nl/max(0.04,4.0*nv*nl))
        for i in range(3):
            reflected[i] += rgb[i] * strength * f[i] * microfacet
    # Copper/polished bronze linear environment; restrained angle modulation.
    env = 0.96 + 0.04*math.cos(angle*3.0 + ring_i*.8)
    strength = min(1.25,max(0.55,float(shade_band))) * env
    rgb = [tone(v*strength*1.42) for v in reflected]
    return tuple(int(round(255*rgb[i])) for i in (2,1,0))
