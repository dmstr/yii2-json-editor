var StringEditor = JSONEditor.defaults.editors.string;


class FileflyEditor extends StringEditor {
  setValue (value) {
    if (value === null) {
      value = '';
    }

    if(this.value === value) {
      return;
    }
    this.input.value = value;
    this.value = value;
    this.onChange();
  }

  register () {
    super.register();
    if(!this.input) return;
    this.input.setAttribute('name', this.formname);
  }

  unregister () {
    super.unregister();
    if(!this.input) return;
    this.input.removeAttribute('name');
  }

  getNumColumns () {
    if(!this.enum_options) return 3;
    var longest_text = this.getTitle().length;
    for(var i=0; i<this.enum_options.length; i++) {
      longest_text = Math.max(longest_text,this.enum_options[i].length+4);
    }
    return Math.min(12,Math.max(longest_text/7,2));
  }

  getValue () {
    if (!this.value) {
      this.value = '';
    }
    return this.value;
  }

  build () {
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

    self.jsoneditor.on('ready',function() {
      self.initSelectize();
    });

    self.jsoneditor.on('addRow',function() {
      self.initSelectize();
    });

    self.jsoneditor.on('moveRow',function() {
      self.initSelectize();
    });

    self.jsoneditor.on('deleteRow',function() {
      self.initSelectize();
    });

  }

  postBuild () {
    super.postBuild();
    this.theme.afterInputReady(this.input);
  }

  initSelectize () {
    var self = this;
    this.destroySelectize();
    this.ajaxPath = '/filefly/api';

    if (this.schema && this.schema.ajaxPath) {
      this.ajaxPath = this.schema.ajaxPath;
    }

    var firstLoad = false;

    this.selectize = $(this.input).selectize({
      valueField: 'path',
      labelField: 'path',
      searchField: 'path',
      placeholder: 'Select a file...',
      maxItems: 1,
      plugins: ['remove_button'],
      /* DO NOT enable Preload
        when enabled it causes item loading issues when triggering multiple move row actions
        in a short amount of time
       */
      preload: false,
      options: [],
      create: true,
      persist: true,
      render: {
        item: function (item, escape) {
          return '<div class="" style="height: 70px">' +
            '<img class="pull-left img-responsive" alt="filefly image" style="max-width: 100px; max-height: 70px" src="' + self.ajaxPath + '?action=stream&path=' + (item.path) + '" />' +
            '<span class="">' + escape(item.path) + '</span><br/>' +
            '</div>';
        },
        option: function (item, escape) {
          return '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" style="height: 150px">' +
            '<img class="img-responsive" alt="filefly image" style="max-height: 100px" src="' + self.ajaxPath + '?action=stream&path=' + (item.path) + '" />' +
            '<span class="">' + escape(item.path) + '</span>' +
            '</div>';
        }
      },
      onLoad: function () {
        var selectize = this
        setTimeout(function () {
          selectize.open()
        }, 0)
      },
      load: function (query, callback) {
        var selectize = this;
        $.ajax({
          url: self.ajaxPath,
          type: 'GET',
          dataType: 'json',
          data: {
            action: 'search',
            q: query,
            limit: 5
          },
          error: function (e) {
            console.log('error', e)
          },
          success: function (data) {
            callback(data);
            if (!firstLoad) {
              selectize.setValue(self.input.value);
              firstLoad = true;
              self.onInputChange();
            }
          }
        });
      },
      onChange: function() {
        self.input.value = this.getValue();
        self.onInputChange();
      }
    });
  }

  onInputChange () {
    this.value = this.input.value;
    this.onChange(true);
  }

  enable () {
    if(!this.always_disabled) {
      this.input.disabled = false;
      if(this.selectize) {
        this.selectize[0].selectize.unlock();
      }
      super.enable();
    }
  }

  disable (always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    if(this.selectize) {
      this.selectize[0].selectize.lock();
    }
    super.disable();
  }

  destroy () {
    this.destroySelectize();
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    super.destroy();
  }

  destroySelectize () {
    if(this.selectize) {
      this.selectize[0].selectize.destroy();
      this.selectize = null;
    }
  }
}

JSONEditor.defaults.editors.filefly = FileflyEditor

// Make it compatible with old widgets
JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === "filefly") {
    return "filefly";
  }
});
