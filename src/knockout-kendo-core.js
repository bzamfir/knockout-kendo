ko.kendo = ko.kendo || {};

ko.kendo.BindingFactory = function() {
    var self = this;

    this.createBinding = function(widgetConfig) {
        //only support widgets that are available when this script runs
        if (!$()[widgetConfig.parent || widgetConfig.name]) {
            return;
        }

        var binding = {};

        //the binding handler's init function
        binding.init = function(element, valueAccessor, allBindingsAccessor) {
              //step 1: build appropriate options for the widget from values passed in and global options
              var options = self.buildOptions(widgetConfig, valueAccessor);

              //apply async, so inner templates can finish content needed during widget initialization
              if (options.async === true || (widgetConfig.async === true && options.async !== false)) {
                  setTimeout(function() {
                      binding.setup(element, options);
                  }, 0);
                  return;
              }

              binding.setup(element, options);
        };

        //build the core logic for the init function
        binding.setup = function(element, options) {
            var widget, $element = $(element);

            //step 2: add handlers for events that we need to react to for updating the model
            self.handleEvents(widgetConfig.events, options, function() { return $element.data(widgetConfig.name); });

            //step 3: initialize widget
            widget = self.getWidget(widgetConfig, options, $element);

            //step 4: set up computed observables to update the widget when observable model values change
            self.watchValues(widget, options, widgetConfig, element);

            //step 5: handle disposal, if there is a destroy method on the widget
            if(widget.destroy) {
                ko.utils.domNodeDisposal.addDisposeCallback(element, function() {
                    widget.destroy();
                });
            }
        };

        binding.options = {}; //global options
        binding.widgetConfig = widgetConfig; //expose the options to use in generating tests

        ko.bindingHandlers[widgetConfig.bindingName || widgetConfig.name] = binding;
    };

    //combine options passed in binding with global options
    this.buildOptions = function(widgetConfig, valueAccessor) {
        var defaultOption = widgetConfig.defaultOption,
            options = ko.utils.extend({}, ko.bindingHandlers[widgetConfig.name].options),
            valueOrOptions = ko.utils.unwrapObservable(valueAccessor());

        if (widgetConfig.optionsFilter) {
            valueOrOptions = widgetConfig.optionsFilter(valueOrOptions);
        }

        if (typeof valueOrOptions !== "object" || (defaultOption && !(defaultOption in valueOrOptions))) {
            options[defaultOption] = valueAccessor();
        }  else {
            ko.utils.extend(options, valueOrOptions);
        }

        return options;
    };

    //return the actual widget
    this.getWidget = function(widgetConfig, options, $element) {
        var widget;
        if (widgetConfig.parent) {
            //locate the actual widget
            var parent = $element.closest("[data-bind*=" + widgetConfig.parent + ":]");
            widget = parent.length ? parent.data(widgetConfig.parent) : null;
        } else {

            widget = $element[widgetConfig.name](self.cleanOptions(options)).data(widgetConfig.name);
        }

        //if the widget option was specified, then fill it with our widget
        if (ko.isObservable(options.widget)) {
            options.widget(widget);
        }

        return widget;
    };

    //get a clean copy of the options by unwrapping one layer and leaving non-observables alone
    this.cleanOptions = function(options) {
        var prop, clean = {};
        for (prop in options) {
            if (options.hasOwnProperty(prop)) {
                clean[prop] = ko.utils.unwrapObservable(options[prop]);
            }
        }

        return clean;
    };

    //respond to changes in the view model
    this.watchValues = function(widget, options, widgetConfig, element) {
        var watchProp, watchValues = widgetConfig.watch;
        if (watchValues) {
            for (watchProp in watchValues) {
                if (watchValues.hasOwnProperty(watchProp) && ko.isObservable(options[watchProp])) {
                    self.watchOneValue(watchProp, widget, options, widgetConfig, element);
                }
            }
        }
    };

    this.watchOneValue = function(prop, widget, options, widgetConfig, element) {
        ko.computed({
            read: function() {
                var action = widgetConfig.watch[prop],
                    value = ko.utils.unwrapObservable(options[prop]),
                    params = widgetConfig.parent ? [element, value] : [value]; //child bindings pass element first to APIs
                //support passing multiple events like ["open", "close"]
                if ($.isArray(action)) {
                    action = widget[value ? action[0] : action[1]];
                } else if (typeof action === "string") {
                    action = widget[action];
                } else {
                    params.push(options, widget);
                }
                if (action) {
                    action.apply(widget, params);
                }
            },
            disposeWhenNodeIsRemoved: element
        });
    };

    //write changes to the widgets back to the model
    this.handleEvents = function(events, options, widgetAccessor) {
        var prop, event;
        if (events) {
            for (prop in events) {
                if (events.hasOwnProperty(prop)) {
                    event = events[prop];
                    event = typeof event === "string" ? { value: event, writeTo: event } : event;
                    if (ko.isObservable(options[event.writeTo])) {
                        self.handleOneEvent(prop, event, options, widgetAccessor);
                    }
                }
            }
        }
    };

    //set on options for now, as using bind does not work for many events
    this.handleOneEvent = function(event, eventOptions, options, widgetAccessor) {
        var existing = options[event];
        options[event] = function() {
            var propOrValue = eventOptions.value,
                widget = widgetAccessor(),
                value = (typeof propOrValue === "string" && widget[propOrValue]) ? widget[propOrValue]() : propOrValue;

            options[eventOptions.writeTo](value);

            //if they passed in a handler in addition to the handling that we need done
            if (existing) {
                existing.apply(this, arguments);
            }
        };
    };
};

ko.kendo.bindingFactory = new ko.kendo.BindingFactory();

//utility to set the dataSource with a clean copy of data. Could be overriden at run-time.
ko.kendo.setDataSource = function(data, options, widget) {
    widget.dataSource[options.dataSource ? "success" : "data"](ko.mapping ? ko.mapping.toJS(data) : ko.toJS(data));
};

//shared function to properly handle passing a kendo.data.DataSource instance in binding
ko.kendo.dataOptionFilter = function(options) {
    //handle a DataSource being passed directly
    if (options instanceof kendo.data.DataSource) {
        options = { dataSource: options };
    }
    //handle a DataSource passed as the data option
    else if (options.data instanceof kendo.data.DataSource) {
        options.dataSource = options.data;
        options.data = {};
    }
    //if they passed the dataSource option, then ensure that data property is at least included to identify the object as options
    if (options.dataSource) {
        options.data = options.data || {};
    }

    return options;
};
