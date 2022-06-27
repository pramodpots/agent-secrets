


exports.init = function(io) {
  io.sockets.on('connection', function (socket) {
    try {
      // insert here your event
      /**
       * it creates or joins a room
       */
      socket.on('create or join', function (room, userId) {
        socket.join(room);
        io.sockets.to(room).emit('joined', room, userId);
      });

      //to create a chat event socket send request
      socket.on('throw-chat', function (room, userId, chatText) {
        io.sockets.to(room).emit('catch-chat',userId, chatText, room);
      });

      //to create a disconnect event socket send request
      socket.on('disconnect', function(){
        console.log('someone disconnected');
      });

      //to create a draw event socket send request
      socket.on('throw-draw', function (room, userId, canvasWidth, canvasHeight, x1, y1, x2, y2, color, thickness) {
        io.sockets.to(room).emit('catch-draw', userId, canvasWidth, canvasHeight, x1, y1, x2, y2, color, thickness);
      });

      //to create a clear canvas event socket send request
      socket.on('throw-clear', function (room, x, y, cW, cH) {
        io.sockets.to(room).emit('catch-clear', x, y, cW, cH );
      });

      //to send knowledge graph and broadcast it
      socket.on('throw-knowledge', function (room, data) {
        socket.broadcast.to(room).emit('catch-knowledge', data);
      })

      socket.on('throw-knowledge-clear', function (room) {
        socket.broadcast.to(room).emit('catch-knowledge-clear');
      })

    }
    catch (e) {
      console.log(e);
    }
  });
}
