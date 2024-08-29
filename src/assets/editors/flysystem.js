var StringEditor = JSONEditor.defaults.editors.string;

class FlysystemEditor extends StringEditor {
  setValue(value) {
    if (value === null) {
      value = '';
    }

    if (this.value === value) {
      return;
    }
    this.input.value = value;
    this.value = value;
    this.onChange();
  }

  register() {
    super.register();
    if (!this.input) return;
    this.input.setAttribute('name', this.formname);
  }

  unregister() {
    super.unregister();
    if (!this.input) return;
    this.input.removeAttribute('name');
  }

  getNumColumns() {
    if (!this.enum_options) return 3;
    var longest_text = this.getTitle().length;
    for (var i = 0; i < this.enum_options.length; i++) {
      longest_text = Math.max(longest_text, this.enum_options[i].length + 4);
    }
    return Math.min(12, Math.max(longest_text / 7, 2));
  }

  getValue() {
    if (!this.value) {
      this.value = '';
    }
    return this.value;
  }

  build() {
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


    if (this.schema.readOnly || this.schema.readonly) {
      this.always_disabled = true;
      this.input.disabled = true;
    }

    this.input.addEventListener('change', function (e) {
      e.preventDefault();
      e.stopPropagation();
      self.onInputChange();
    });

    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton);
    this.container.appendChild(this.control);

    self.jsoneditor.on('ready', function () {
      self.initSelectize();
    });

    self.jsoneditor.on('addRow', function () {
      self.initSelectize();
    });

    self.jsoneditor.on('moveRow', function () {
      self.initSelectize();
    });

    self.jsoneditor.on('deleteRow', function () {
      self.initSelectize();
    });

  }

  postBuild() {
    super.postBuild();
    this.initSelectize();
    this.theme.afterInputReady(this.input);
  }

  hasThumbnailPreview(item) {
    return (item && item.extraMetadata && item.extraMetadata.thumbnail)
  }

  hasImageExtension (path) {
    if (typeof path !== 'string') {
      throw 'path is not a string!'
    }

    var imageExtensions = ['jpg', 'jpeg', 'gif', 'svg', 'png', 'bmp']

    imageExtensions = imageExtensions.map(extension => {
      return extension.toLowerCase()
    })

    var extension = path.split('.').pop().toLowerCase()

    return (imageExtensions.indexOf(extension) !== -1)
  }

  initSelectize() {
    var self = this;
    this.destroySelectize();
    this.searchUrl = '/filemanager/api/search';
    this.streamUrl = '/filemanager/api/stream';

    if (this.schema && this.schema.searchUrl) {
      this.searchUrl = this.schema.searchUrl;
    }

    if (this.schema && this.schema.streamUrl) {
      this.streamUrl = this.schema.streamUrl;
    }

    var firstLoad = false;

    this.selectize = $(this.input).selectize({
      valueField: 'fullPath',
      labelField: 'name',
      searchField: 'name',
      placeholder: 'Search for a file...',
      maxItems: 1,
      plugins: ['remove_button'],
      preload: false,
      options: [],
      create: true,
      persist: false,
      render: {
        item: function (item, escape) {
          if (self.hasImageExtension(item.fullPath)) {
            return '<div class="" style="height: 70px">' +
              '<img class="pull-left img-responsive" alt="flysystem image" style="max-width: 100px; max-height: 70px" src="' + escape(self.streamUrl) + '?path=' + escape(item.fullPath) + '" />' +
              '<span class="">' + escape(item.name) + '</span><br/>' +
              '</div>';
          }

          return '<span><i class="fa fa-file"></i> ' + escape(item.name) + '</span>';
        },
        option: function (item, escape) {
          if (self.hasThumbnailPreview(item)) {
            return '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" style="height: 150px">' +
              '<img class="img-responsive" alt="flysystem image" style="max-height: 100px" src="' + escape(item.extraMetadata.thumbnail) + '" />' +
              '<span class="">' + escape(item.name) + '</span>' +
              '</div>';
          }

          return '<span><i class="fa fa-file"> ' + escape(item.name) + '</span>';
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
          url: self.searchUrl,
          type: 'GET',
          dataType: 'json',
          data: {
            q: query
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
      onChange: function () {
        self.input.value = this.getValue();
        self.onInputChange();
      }
    });
  }

  onInputChange() {
    this.value = this.input.value;
    this.onChange(true);
  }

  enable() {
    if (!this.always_disabled) {
      this.input.disabled = false;
      if (this.selectize) {
        this.selectize[0].selectize.unlock();
      }
      super.enable();
    }
  }

  disable(always_disabled) {
    if (always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    if (this.selectize) {
      this.selectize[0].selectize.lock();
    }
    super.disable();
  }

  destroy() {
    this.destroySelectize();
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    super.destroy();
  }

  destroySelectize() {
    if (this.selectize) {
      this.selectize[0].selectize.destroy();
      this.selectize = null;
    }
  }
}

JSONEditor.defaults.editors.flysystem = FlysystemEditor;

// Make it compatible with old widgets
JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === "string" && schema.format === "flysystem") {
    return "flysystem";
  }
});
