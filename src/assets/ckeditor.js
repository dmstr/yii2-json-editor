JSONEditor.defaults.editors.ckeditor = JSONEditor.AbstractEditor.extend({
  setValue: function(value) {
    if (value === null) {
      value = '';
    }

    if(this.value === value) {
      return;
    }
    this.input.value = value;
    this.value = value;
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

    this.initCKEditor();
  },
  postBuild: function() {
    this._super();
    this.theme.afterInputReady(this.input);
  },
  initCKEditor: function() {
    var self = this;
    if (window.CKCONFIG) {
      self.instance = CKEDITOR.replace(self.input, window.CKCONFIG);
    } else {
      self.instance = CKEDITOR.replace(self.input);
    }

    CKEDITOR.on('instanceReady', function(evt) {
      if (evt.editor === self.instance) {
        evt.editor.setData(self.value);
      }
    });
    self.instance.on('change', function () {
      self.input.value = self.instance.getData();
      self.onInputChange();
    });
  },
  onInputChange: function() {
    this.setValue(this.input.value);
    this.onChange(true);
  },
  onMove: function() {
    this.destroyCKEditor();
    this.initCKEditor();
  },
  enable: function() {
    if(!this.always_disabled) {
      this.input.disabled = false;
      if(this.instance) {
        this.instance.setReadOnly(false);
      }
      this._super();
    }
  },
  disable: function(always_disabled) {
    if(always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    if(this.instance) {
      self.instance.setReadOnly(true);
    }
    this._super();
  },
  destroy: function() {
    if(this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if(this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if(this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    this.destroyCKEditor();
    this._super();
  },
  destroyCKEditor: function() {
    if(this.instance) {
      this.instance.destroy();
      this.instance = null;
    }
  }
});

// Make it compatible with old widgets
/*JSONEditor.defaults.resolvers.unshift(function(schema) {
  if(schema.type === "string" && schema.format === "filefly") {
    return "filefly";
  }
});*/
