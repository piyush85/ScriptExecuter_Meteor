notificationCollection = new Meteor.Collection(null);

notifications.on('message', function(message) {
    notificationCollection.insert({
        message: message
    });
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
    'submit form': function(event) {
        event.preventDefault();
        notificationCollection.remove({});
        var form={},
            configData = Config.findOne(Session.get('chosenConfig'));

        $.each($(event.target).serializeArray(), function() {
            form[this.name] = this.value;
        });
        $.extend(configData.config, form);
        Meteor.call("runScript", configData);
    }
})