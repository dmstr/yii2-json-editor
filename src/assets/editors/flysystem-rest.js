// file generated with AI assistance: Claude Code - 2026-07-09 00:00:00 UTC
//
// Selectize based editor for the "eluhr/yii2-flysystem-rest-api" file manager.
//
// This is a filefly.js compatible drop-in replacement: same selectize UI,
// same value semantics (stores a single file path string) and the same
// array row re-init handling. The differences to filefly.js are the backend
// contract:
//
//   - search:  GET  {apiBaseUrl}/search?q=&page=&storageId=   (JWT protected)
//   - stream:  GET  {apiBaseUrl}/stream?path=                  (no auth)
//
// The search endpoint requires an "Authorization: Bearer <jwt>" header. Since
// the JWT is only available server side it is injected into a global config
// object by the widget / view:
//
//   window.FLYSYSTEMRESTCONFIG = {
//     apiBaseUrl: '/filesystem-rest/api', // module route base, no trailing slash
//     jwt: '<token>',                     // bearer token for the search request
//     storageId: null,                    // optional storage id filter
//     imageExtensions: ['jpg', 'jpeg', 'gif', 'svg', 'png', 'bmp']
//   }
//
// Per field overrides are possible via the schema:
//   { "type": "string", "format": "flysystem-rest",
//     "apiBaseUrl": "...", "storageId": "..." }

var StringEditor = JSONEditor.defaults.editors.string;

class FlysystemRestEditor extends StringEditor {
  setValue (value) {
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

  register () {
    super.register();
    if (!this.input) return;
    this.input.setAttribute('name', this.formname);
  }

  unregister () {
    super.unregister();
    if (!this.input) return;
    this.input.removeAttribute('name');
  }

  getNumColumns () {
    if (!this.enum_options) return 3;
    var longest_text = this.getTitle().length;
    for (var i = 0; i < this.enum_options.length; i++) {
      longest_text = Math.max(longest_text, this.enum_options[i].length + 4);
    }
    return Math.min(12, Math.max(longest_text / 7, 2));
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

  postBuild () {
    super.postBuild();
    this.initSelectize();
    this.theme.afterInputReady(this.input);
  }

  config () {
    return window.FLYSYSTEMRESTCONFIG || {};
  }

  hasImageExtension (path) {
    if (typeof path !== 'string') {
      throw 'path is not a string!';
    }

    var imageExtensions = ['jpg', 'jpeg', 'gif', 'svg', 'png', 'bmp'];

    if (this.config().imageExtensions) {
      imageExtensions = this.config().imageExtensions;
    }

    imageExtensions = imageExtensions.map(function (extension) {
      return extension.toLowerCase();
    });

    var extension = path.split('.').pop().toLowerCase();

    return (imageExtensions.indexOf(extension) !== -1);
  }

  hasThumbnailPreview (item) {
    return this.hasImageExtension(item.fullPath);
  }

  streamUrl (path) {
    return this.apiBaseUrl + '/stream?path=' + encodeURIComponent(path);
  }

  initSelectize () {
    var self = this;
    this.destroySelectize();

    // resolve backend configuration: schema overrides win over global config
    var config = this.config();
    this.apiBaseUrl = (this.schema && this.schema.apiBaseUrl) || config.apiBaseUrl || '/filesystem-rest/api';
    // strip trailing slash for consistent URL building
    this.apiBaseUrl = this.apiBaseUrl.replace(/\/+$/, '');
    this.storageId = (this.schema && this.schema.storageId) || config.storageId || null;
    this.jwt = config.jwt || null;

    var firstLoad = false;

    this.selectize = $(this.input).selectize({
      valueField: 'fullPath',
      labelField: 'fullPath',
      searchField: 'fullPath',
      placeholder: 'Select a file...',
      maxItems: 1,
      plugins: ['remove_button'],
      /* DO NOT enable Preload
        when enabled it causes item loading issues when triggering multiple move row actions
        in a short amount of time
       */
      preload: false,
      options: [],
      create: false,
      persist: true,
      render: {
        item: function (item, escape) {
          if (self.hasThumbnailPreview(item)) {
            return '<div class="" style="height: 70px">' +
              '<img class="pull-left img-responsive" alt="flysystem image" style="max-width: 100px; max-height: 70px" src="' + self.streamUrl(item.fullPath) + '" />' +
              '<span class="">' + escape(item.fullPath) + '</span><br/>' +
              '</div>';
          }

          return '<span><i class="fa fa-file"></i> ' + escape(item.fullPath) + '</span>';
        },
        option: function (item, escape) {
          if (self.hasThumbnailPreview(item)) {
            return '<div class="col-xs-6 col-sm-4 col-md-3 col-lg-2" style="height: 150px">' +
              '<img class="img-responsive" alt="flysystem image" style="max-height: 100px" src="' + self.streamUrl(item.fullPath) + '" />' +
              '<span class="">' + escape(item.fullPath) + '</span>' +
              '</div>';
          }

          return '<span><i class="fa fa-file"> ' + escape(item.fullPath) + '</span>';
        }
      },
      onLoad: function () {
        var selectize = this;
        setTimeout(function () {
          selectize.open();
        }, 0);
      },
      load: function (query, callback) {
        var selectize = this;
        var data = {
          q: query,
          page: 0
        };
        if (self.storageId) {
          data.storageId = self.storageId;
        }

        $.ajax({
          url: self.apiBaseUrl + '/search',
          type: 'GET',
          dataType: 'json',
          data: data,
          beforeSend: function (xhr) {
            if (self.jwt) {
              xhr.setRequestHeader('Authorization', 'Bearer ' + self.jwt);
            }
          },
          error: function (e) {
            console.log('flysystem-rest search error', e);
            callback();
          },
          success: function (response) {
            // paginated responses are wrapped: { results: [...], pagination: {...} }
            var results = (response && response.results) ? response.results : response;
            callback(results);
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

  onInputChange () {
    this.value = this.input.value;
    this.onChange(true);
  }

  enable () {
    if (!this.always_disabled) {
      this.input.disabled = false;
      if (this.selectize) {
        this.selectize[0].selectize.unlock();
      }
      super.enable();
    }
  }

  disable (always_disabled) {
    if (always_disabled) this.always_disabled = true;
    this.input.disabled = true;
    if (this.selectize) {
      this.selectize[0].selectize.lock();
    }
    super.disable();
  }

  destroy () {
    this.destroySelectize();
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label);
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description);
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input);
    super.destroy();
  }

  destroySelectize () {
    if (this.selectize) {
      this.selectize[0].selectize.destroy();
      this.selectize = null;
    }
  }
}

JSONEditor.defaults.editors['flysystem-rest'] = FlysystemRestEditor;

JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === 'string' && schema.format === 'flysystem-rest') {
    return 'flysystem-rest';
  }
});
