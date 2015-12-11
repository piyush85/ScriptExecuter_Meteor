notificationCollection = new Meteor.Collection(null);

notifications.on('message', function(message) {
    notificationCollection.insert({
        message: message
    });
});
notifications.on('loading', function(message) {
    notificationCollection.remove({});
});
Template.body.helpers({

    configs: function() {
        return Config.find();
    },
    formData: function() {
        return Config.findOne(Session.get('chosenConfig'));
    },
    output: function(){
        return notificationCollection.find();
    }

});

Template.body.events({
    'click .configButtons': function(event){

        var config = event.target.value;

        var item = Config.findOne({ConfigName: config});

        return Session.set('chosenConfig', item);
    },
    'click .submitForm': function(){
      $('.configForm').submit();
    },
    'click .saveConfig' : function(){
        var scriptConfig = $('.configForm').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        var config = $('.hostConfigForm').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        config["config"] = scriptConfig;
        var document = Config.findOne({ConfigName:config.ConfigName});
        if(!document){
            Config.insert(config);
            alert("config added successfully");
        }else{
            Config.update(document._id,config);
            alert("config updated successfully");
        }
    },
    'click .deleteConfig' : function(){
        var config = $('.hostConfigForm').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        var document = Config.findOne({ConfigName:config.ConfigName});
        if(document){
            if(Config.find().count() === 1){
                alert("cannot delete last config");
            }else{
                Config.remove(document._id);
                alert("config deleted successfully");
            }
        }else{
            alert("config not found");
        }
    },
    'submit form': function(event) {
        event.preventDefault();
        notificationCollection.remove({});
        notificationCollection.insert({
            message: "Loading..."
        });
        var form={},
            configData = Config.findOne(Session.get('chosenConfig'));

        $.each($(event.target).serializeArray(), function() {
            form[this.name] = this.value;
        });
        $.extend(configData.config, form);
        Meteor.call("runScript", configData);
    }
});