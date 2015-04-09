---
layout: default
prefix: ../
widgetName: Grid
description: The Grid widget allows a user to interact with tabular data.
docs: http://docs.telerik.com/kendo-ui/api/web/grid
examples:
    - title: Basic Example
      description: This example demonstrates passing a single option to bind data against the Grid widget.
      view: |
        <div data-bind="kendoGrid: items"> </div>
      js: |
        var ViewModel = function() {
            this.items = ko.observableArray([
                { id: "1", name: "apple"},
                { id: "2", name: "orange"},
                { id: "3", name: "banana"}
            ]);
        };
      selected: true
      id: one
    - title: Passing additional options
      description: This example demonstrates passing additional options in the data-bind attribute with *data* now being explicitly specified. The *Add Item* button updates the underlying data and shows that the Grid remains in sync.
      view: |
        <div data-bind="kendoGrid: { data: items, groupable: true, scrollable: true, sortable: true, pageable: { pageSize: 10 } }"> </div>
        <button data-bind="click: addItem">Add Item</button>
      js: |
        var ViewModel = function() {
            this.items = ko.observableArray([
                { id: "1", name: "apple"},
                { id: "2", name: "orange"},
                { id: "3", name: "banana"}
            ]);

            this.addItem = function() {
                var num = this.items().length + 1;
                this.items.push({ id: num, name: "new" + num});
            };
        };
      id: two
    - title: Using Knockout templates
      description: This example demonstrates using Knockout templates for grid rows and alternate rows.
      view: |
        <div data-bind="kendoGrid: { data: items, rowTemplate: 'rowTmpl', altRowTemplate: 'altTmpl', useKOTemplates: true }"> </div>
        <button data-bind="click: addItem">Add Item</button>
        <script id="rowTmpl" type="text/html">
            <tr>
                <td data-bind="text: id"></td>
                <td>
                    <input data-bind="value: name" />
                </td>
                <td>
                    <a href="#" data-bind="click: $root.removeItem">x</a>
                </td>
            </tr>
        </script>
        <script id="altTmpl" type="text/html">
            <tr>
                <td>Alt Row</td>
                <td data-bind="text: name"></td>
                <td>
                    <a href="#" data-bind="click: $root.removeItem">x</a>
                </td>
            </tr>
        </script>
      js: |
        var ViewModel = function() {
            this.items = ko.observableArray([
                { id: "1", name: ko.observable("apple")},
                { id: "2", name: ko.observable("orange")},
                { id: "3", name: ko.observable("banana")}
            ]);

            this.addItem = function() {
                var num = this.items().length + 1;
                this.items.push({ id: num, name: "new" + num});
            };

            this.removeItem = function(item) {
                this.items.remove(item);
            }.bind(this);
        };
      id: three
    - title: Using global options
      description: This example demonstrates setting global options in *ko.bindingHandlers.kendoGrid.options*. This helps to simplify the markup for settings that can be used as a default for all instances of this widget.
      view: |
        <div data-bind="kendoGrid: items"> </div>
        <button data-bind="click: addItem">Add Item</button>
      js: |
        var ViewModel = function() {
            this.items = ko.observableArray([
                { id: "1", name: "apple"},
                { id: "2", name: "orange"},
                { id: "3", name: "banana"}
            ]);

            this.addItem = function() {
                var num = this.items().length + 1;
                this.items.push({ id: num, name: "new" + num});
            };
            
            ko.bindingHandlers.kendoGrid.options = {
                groupable: true,
                scrollable: true,
                sortable: true,
                pageable: true
            };
        };
      id: four
      
liveOptions:
    - name: data
      description: An array, observableArray, or kendo.data.DataSource to use in the grid
    - name: widget
      description: If specified, will populate an observable with a reference to the actual widget
---

{% include widget.html %}