function handleSocket(io)
{
    io.on("connection", (socket) => {
        console.log("Connected");
        socket.emit("hello-world");
      
        socket.on('joinRoom', (sessionId) => {
         console.log("in server");
        });
      
      })
}


module.exports = {handleSocket}