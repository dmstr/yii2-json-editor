JSONEditor.defaults.editors.filefly = JSONEditor.AbstractEditor.extend({
  setValue: function(value) {
    if (value === null) {
      value = '';
    }

    if(this.value === value) {
      return;
    }
    this.input.value = value;
    this.onChange();
  },
  register: function() {
    this._super();
    if(!this.input) return;
    this.input.setAttribute('name', this.formname);
  },
  unregister: function() {
    this._super();
    if(!this.input) return;
    this.input.removeAttribute('name');
  },
  getNumColumns: function() {
    if(!this.enum_options) return 3;
    var longest_text = this.getTitle().length;
    for(var i=0; i<this.enum_options.length; i++) {
      longest_text = Math.max(longest_text,this.enum_options[i].length+4);
    }
    return Math.min(12,Math.max(longest_text/7,2));
  },
  getValue: function() {
    if (!this.value) {
      this.value = '';
    }
    return this.value;
  },
  build: function() {
    var self = this;

    if (!this.options.compact) {
      this.header = this.label = this.theme.getFormInputLabel(this.getTitle());
    }

    if (this.schema.description) {
      this.description = this.theme.getFormInputDescription(this.schema.description);
    }

    if (this.options.infoText) {
      this.infoButton = this.theme.getInfoButton(this.options.infoText);
    }

    if (this.options.compact) {
      this.container.classList.add('compact');
    }

    this.input = this.theme.getFormInputField('text');


    if(this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      this.input.disabled = true;
    }

    this.input.addEventListener('change',function(e) {
      e.preventDefault();
      e.stopPropagation();
      self.onInputChange();
    });

    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton);
    this.container.appendChild(this.control);

    this.initSelectize();
  },
  postBuild: function() {
    this._super();
    this.theme.afterInputReady(this.input);
  },
  initSelectize: function() {
    var self = this;
    this.path = this.schema.path || '/filefly/api';

    this.selectize = $(this.input).selectize({
      valueField: 'path',
      labelField: 'path',
      searchField: 'path',
      placeholder: 'Select a file...',
      maxItems: 1,
      plugins: ['remove_button'],
      preload: true,
      options: [],
      create: false,
      render: {
        item: function (item, escape) {
          return '<div class="" style="height: 70px">' +
            '<img class="pull-left img-responsive" alt="filefly image" style="max-width: 100px; max-height: 70px" src="' + self.path + '?action=stream&path=' + (item.path) + '" />' +
            '<span class="">' + escape(item.path) + '</span><br/>' +
            '<span class="">' + 'banana' + '</span><br/>' +
            '</div>';
        },
        option: function (item, escape) {
          return '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" style="height: 150px">' +
            '<img class="img-responsive" alt="filefly image" style="max-height: 100px" src="' + self.path + '?action=stream&path=' + (item.path) + '" />' +
            '<span class="">' + escape(item.path) + '</span>' +

            '</div>';
        }
      },
      load: function (query, callback) {
        var selectize = this;
        $.ajax({
          url: self.path,
          type: 'GET',
          dataType: 'json',
          data: {
            action: 'search',
            q: query,
            page_limit: 20
          },
          error: function (e) {
          },
          success: function (data) {
            callback(data);
            selectize.setValue(self.input.value); // set initial value
            self.onInputChange();
          }
        });
      },
      onDropdownClose: function () {
        self.input.value = this.getValue();
        self.onInputChange();
      }
    });
  },
  onInputChange: function() {
    this.value = this.input.value;
    this.onChange(true);
  },
  onMove: function() {
    this.destroySelectize();
    this.initSelectize();
  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
      if(this.selectize) {
        this.selectize[0].selectize.unlock();
      }
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    if(this.selectize) {
      this.selectize[0].selectize.lock();
    }
    this._super();
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    this.destroySelectize();
    this._super();
  },
  destroySelectize: function() {
    if(this.selectize) {
      this.selectize[0].selectize.destroy();
      this.selectize = null;
    }
  }
});

// Make it compatible with old widgets
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === "filefly") {
    return "filefly";
  }
});
