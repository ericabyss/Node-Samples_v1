const io = require('socket.io')();
const Feed = require('./feed.js');

io.on('connection', function (socket) {

   // Handshake 정보 : socket.handshake

   Feed.fetchRecentFeed((err, feeds) => {
      if ( err ) {
         console.log('Error ', error);
         socket.emit('error');
         return;
      }

      const data = {
         count : feeds.length,
         feeds : feeds
      };

      socket.emit('feed', data);
   });

   socket.on('write', (data) => {
      console.log('data : ', data);
      // 좀 구림
      console.log('handshake : ', socket.handshake);
      const sessionID = socket.handshake.sessionID;
      //console.log('sessionStore : ', socket.handshake.sessionStore.sessions);

      const sessionStr = socket.handshake.sessionStore.sessions[sessionID];
      const session = JSON.parse(sessionStr);
      const user = session.user;

      // 세션에 저장된 이름 사용. 클라이언트에게는 message만 전달
      var newFeed = {
         author : user.name,
         message : data.message
      };

      if ( data.image ) {
         const imageUrl = saveImage(data.image);
         newFeed.image = imageUrl;
      }

      Feed.writeFeed(newFeed, (err, result) => {
         if ( err ) {
            console.log('Writing Feed Error : ',err);
            socket.emit('error');
            return;
         }
         io.emit('feed', {count:1, feeds:[result]});
         console.log('Writing feed success ', result);
      });
   });

   function saveImage(buffer) {
      const now = new Date();
      const url = 'images/image_' + now.getYear() + now.getMonth() + now.getDay() + now.getHours() + now.getMinutes() + now.getSeconds() + '.jpg';
      fs.writeFileSync('public/' + url, buffer);
      return url;
   }
});

module.exports = io;
