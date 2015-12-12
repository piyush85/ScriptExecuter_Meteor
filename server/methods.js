var exec = Meteor.npmRequire('ssh-exec');
notifications.permissions.read(function(userId, eventName) {
    return true;
});
Meteor.methods({
    runScript: function (data) {
        var commandStr = data.ScriptPath + data.ScriptName;

        for (var conf in data.config){
            commandStr += " " + data.config[conf];
        }
        var connection_options = {
            host:data.IP,
            //port: 22,
            user: data.User,
            password:data.pass
        };

        var hosts = [
            data.IP
        ];

        var cmds = [
            commandStr
        ];
        var stream = process.stdin
            .pipe(exec(commandStr, connection_options))

        var buffers = [];
        stream.on('data', function(buffer) {
            buffers.push(buffer);
            notifications.emit('loading');
            notifications.emit('message', buffer.toString());
        });
        stream.on('end', function() {
            var buffer = Buffer.concat(buffers);
            //notifications.emit('message', buffer.toString());
       });
        stream.on('error', function(error) {
            notifications.emit('error', error.toString());
        });
    }
});