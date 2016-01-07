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
                },
                createdBy:"qFJdcSHb5Rcuv2F3r"
            },
            {
                ConfigName:"CONFIG 1",
                ConfType:"DbServer",
                IP:"10.11.0.72",
                User:"root",
                pass:"r00t.!@#",
                ScriptPath:"/root/client",
                ScriptName: "master.sh",
                config: {
                    ServerName:"10.27.0.93",
                    ServerPort:"11106",
                    UserName:"system",
                    Password:"Info_123",
                    DatabaseName:"orcl",
                    ClientVersion:"1",
                    TotalConnections:"1",
                    Concurrency:"1",
                    AbsoluteFilePath:"/home/idb/javaClient/testcase.sql"
                },
                createdBy:"qFJdcSHb5Rcuv2F3r"
            },
            {
                ConfigName:"CONFIG 2",
                ConfType:"DbServer",
                IP:"10.11.0.227",
                User:"root",
                pass:"r00t.!@#",
                ScriptPath:"/root/client",
                ScriptName: "master.sh",
                config: {
                    ServerName:"10.27.0.93",
                    ServerPort:"11106",
                    UserName:"system",
                    Password:"Info_123",
                    DatabaseName:"orcl",
                    ClientVersion:"2",
                    TotalConnections:"1",
                    Concurrency:"1",
                    AbsoluteFilePath:"/home/idb/javaClient/testcase.sql"
                },
                createdBy:"qFJdcSHb5Rcuv2F3r"
            },
            {
                ConfigName: "CONFIG 3",
                ConfType:"DbServer",
                IP: "10.0.53.10",
                User: "idb",
                pass: "r00t.!@#",
                ScriptPath: "",
                ScriptName: "./testScript.sh",
                config: {
                    ServerName: "10.27.0.93",
                    ServerPort: "11106",
                    UserName: "system",
                    Password: "Info_123",
                    DatabaseName: "orcl",
                    ClientVersion: "2",
                    TotalConnections: "1",
                    Concurrency: "1",
                    AbsoluteFilePath: "/home/idb/javaClient/testcase.sql"
                },
                createdBy:"qFJdcSHb5Rcuv2F3r"
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