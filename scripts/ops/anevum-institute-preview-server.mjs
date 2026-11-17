// Loopback-only preview server. Never deploy to Cloudflare or bind a public interface.
import {createServer} from "node:http";
import worker from "../../apps/anevum-institute-preview/worker.mjs";
const host="127.0.0.1",port=4183;
const server=createServer(async(req,res)=>{
  try{
    const url=new URL(req.url||"/","https://anevum.com");
    const response=await worker.fetch(new Request(url,{method:req.method}));
    res.writeHead(response.status,Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){
    res.writeHead(500,{"Content-Type":"text/plain"});
    res.end("Preview server error");
    console.error("INSTITUTE_PREVIEW_LOOPBACK_ERROR",error?.message);
  }
});
server.listen(port,host,()=>console.log("ANEVUM_INSTITUTE_PREVIEW_LOOPBACK http://"+host+":"+port));
