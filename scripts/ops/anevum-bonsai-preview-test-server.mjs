/**
 * Local-only HTTP adapter for browser checks of the isolated bonsai Worker.
 * Always creates an HTTPS-origin Request for the standalone Worker module;
 * never serves the old public site, protected APIs, or production bindings.
 */
import {createServer} from "node:http";
import worker from "../../apps/anevum-bonsai/worker.mjs";

const port = Number(process.env.BONSAI_TEST_PORT || 4187);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw Error("Invalid test port");

createServer(async (request, response) => {
  try {
    const url = new URL(request.url || "/", "https://anevum.com");
    const upstream = new Request(url, {
      method: request.method,
      headers: request.headers
    });
    const result = await worker.fetch(upstream);
    response.writeHead(result.status, Object.fromEntries(result.headers));
    response.end(Buffer.from(await result.arrayBuffer()));
  } catch (error) {
    console.error("Bonsai local adapter error", error);
    response.writeHead(500, {"Content-Type":"text/plain; charset=utf-8"});
    response.end("Browser test adapter failure");
  }
}).listen(port, "127.0.0.1", () => console.log("BONSAI_LOCAL_TEST_SERVER_READY",port));
