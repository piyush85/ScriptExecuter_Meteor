notificationCollection = new Meteor.Collection(null);
var configLoad = function(config){
    $(".configButtons[value='"+config+"']").trigger("click");
};
Meteor.startup(function () {
    Meteor.subscribe("Config");
    notifications.on('message', function(message, userId) {
        if(userId === Meteor.userId()){
            notificationCollection.insert({
                message: message
            });
            $(".output")[0].scrollTop = $(".output")[0].scrollHeight;
        }
    });
    notifications.on('loading', function(userId) {
        if(userId === Meteor.userId()){
            notificationCollection.remove({message:"Loading..."});
        }
    });
    notifications.on('error', function(message, userId) {
        if(userId === Meteor.userId()){
            notificationCollection.remove({});
            notificationCollection.insert({
                error: message
            });
        }
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
Template.configButton.onRendered(function(){
    this.$('.configButtons').tooltip({'container': 'span'});
})
var fetchAggHosts = function(){
    Meteor.call("aggregatedHosts", function(err,res){
        Session.set("aggHosts", res);
    });
};
fetchAggHosts();
Template.config.helpers({
    configs: function() {
        return Session.get("aggHosts");
    },
    selectedHost: function(){
        return Session.get('chosenHost') || "Host";
    },
    configTypes: function(){
        return Session.get("aggregatedConfType");
    },
    selectedConfigType: function(){
        return Session.get('chosenConfigType') || "Config Type";
    },
    filterConfigs: function(){
        var host = Session.get('chosenHost'),
            confType = Session.get("chosenConfigType");
        if(host && confType && host!=="All" && confType!=="All"){
            return Config.find({$or:[{ConfigName:"Blank Config"},{IP:Session.get('chosenHost'), ConfType:Session.get("chosenConfigType")}]});
        }else if(host === "All" && confType !=="All"){
            return Config.find({$or:[{ConfigName:"Blank Config"},{ConfType:Session.get("chosenConfigType")}]});
        }else if(host !== "All" && confType ==="All"){
            return Config.find({$or:[{ConfigName:"Blank Config"},{IP:Session.get('chosenHost')}]});
        } else if(confType === "All"){
            return Config.find({});
        }
        return Config.find({ConfigName:"Blank Config"});
    }
});
Template.config.events({
    'click .hostIP' : function(event){
        var host =  event.target.getAttribute("data-id");
        Session.set('chosenConfigType', "");
        Meteor.call("aggregatedConfType", host, function(err,res){
            Session.set("aggregatedConfType", res);
        });
        return Session.set('chosenHost', event.target.text);
    },
    'click .configType' : function(event){
        var configType =  event.target.getAttribute("data-id");
        return Session.set('chosenConfigType', event.target.text);
    }
});

Template.newConfigForm.helpers({
    isEqual:function (lhs, rhs) {
        return lhs === rhs;
    }
})
Template.body.helpers({
    IP: function(){
      return Config.find({});
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
        config["createdBy"] = Meteor.userId();
        var document = Config.findOne({ConfigName:config.ConfigName});
        if(!document){
            Config.insert(config);
            sAlert.success("config added successfully");
        }else{
            if(config.ConfigName !== "Blank Config" ){
                Config.update({_id:document._id}, {$set: config});
                sAlert.success("config updated successfully");
            }else{
                sAlert.warning("Blank Config cannot be updated, please select a new config name");
            }

        }
       configLoad(config.ConfigName);
        fetchAggHosts();
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
        fetchAggHosts();
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