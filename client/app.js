notificationCollection = new Meteor.Collection(null);
var configLoad = function(config){
    $(".configButtons[value='"+config+"']").trigger("click");
};
Meteor.startup(function () {
    notifications.on('message', function(message) {
        notificationCollection.insert({
            message: message
        });
    });
    notifications.on('loading', function(message) {
        notificationCollection.remove({});
    });
    notifications.on('error', function(message) {
        notificationCollection.remove({});
        notificationCollection.insert({
            error: message
        });
    });
    sAlert.config({
        effect: 'jelly',
        position: 'top-right',
        timeout: 5000,
        html: false,
        onRouteClose: true,
        stack: true,
        beep: false
    });
});
Template.config.rendered = function(){
    configLoad("Blank Config");
};
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
            sAlert.success("config added successfully");
        }else{
            if(config.ConfigName !== "Blank Config" ){
                Config.update(document._id,config);
                sAlert.success("config updated successfully");
            }else{
                sAlert.warning("Blank Config cannot be updated, please select a new config name");
            }

        }
       configLoad(config.ConfigName);
    },
    'click .deleteConfig' : function(){
        var config = $('.hostConfigForm').serializeArray().reduce(function(obj, item) {
            obj[item.name] = item.value;
            return obj;
        }, {});
        var document = Config.findOne({ConfigName:config.ConfigName});
        if(document){
            if(Config.find().count() === 1 || config.ConfigName === "Blank Config"){
                sAlert.warning("cannot delete Blank Config");
            }else{
                Config.remove(document._id);
                sAlert.success("config deleted successfully");
                configLoad("Blank Config");
            }
        }else{
            sAlert.error("config not found");
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