var exec = Meteor.npmRequire('ssh-exec');
notifications.permissions.read(function(eventName) {
    return true;
});
notifications.permissions.write(function(eventName) {
    return true;
});
Config.allow({
    'insert': function (userId,doc) {
        /* user and doc checks ,
         return true to allow insert */
        return true;
    },
    'update': function(){
        return true;
    },
    'remove': function(){
        return true;
    }
});

Meteor.publish("Config", function () {
    return Config.find({$or:[{createdBy:this.userId},{ConfigName:"Blank Config"}]});
});
Meteor.methods({
    aggregatedHosts: function(){
        return Config.aggregate([{$match:{createdBy:this.userId}},{$group:{_id:"$IP"}}]);
    },
    aggregatedConfType: function(host){
        return Config.aggregate([{$match:{createdBy:this.userId, IP:host}},{$group:{_id:"$ConfType"}}]);
    },
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