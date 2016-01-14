(function(){
    // run this when the meteor app is started
    Meteor.startup(function() {
        // if there are no polls available create sample data
        var document;

        // create sample polls
        var sampleConfig = [
            {
                ConfigName:"Blank Config",
                ConfType:"DbServer",
                IP:"",
                User:"",
                pass:"",
                ScriptPath:"",
                ScriptName: "",
                config: {
                    ServerName:"",
                    ServerPort:"",
                    UserName:"",
                    Password:"",
                    DatabaseName:"",
                    ClientVersion:"",
                    TotalConnections:"",
                    Concurrency:"",
                    AbsoluteFilePath:""
                }
            }
        ];
        // loop over each sample poll and insert into database
        _.each(sampleConfig, function(config) {
            document = Config.findOne({ConfigName:config.ConfigName});
            if(!document){
                Config.insert(config);
            }else{
                Config.update(document,config);
            }


        });

    });
})()