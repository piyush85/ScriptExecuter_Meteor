var exec = Meteor.npmRequire('ssh-exec');
notifications.permissions.read(function(eventName) {
    return true;
});
notifications.permissions.write(function(eventName) {
    return true;
});
Meteor.publish("Config", function () {
    return Config.find({createdBy:this.userId});
});
Meteor.methods({
    runScript: function (data) {
        var commandStr = data.ScriptPath + data.ScriptName,
            userId = this.userId;

        for (var conf in data.config){
            if(data.config[conf])
            commandStr += " " + conf +":"+data.config[conf];
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
        notifications.emit('message', "Command:" + commandStr, userId);
        var stream = process.stdin
            .pipe(exec(commandStr, connection_options));

        var buffers = [];
        stream.on('data', function(buffer) {
            buffers.push(buffer);
            notifications.emit('loading', userId);
            notifications.emit('message', buffer.toString(), userId);
        });
        stream.on('end', function() {
            var buffer = Buffer.concat(buffers);
       });
        stream.on('error', function(error) {
            notifications.emit('error', error.toString(), userId);
        });
    }
});