var StringEditor = JSONEditor.defaults.editors.string

class FlysystemEditor extends StringEditor {
  setValue(value) {
    value = value || ''
    if (this.value === value) return

    this.input.value = value
    this.value = value
    this.setOption(value)
    this.onChange()
  }

  build() {
    this.selectInput = this.theme.getSelectInput()
    this.input = this.theme.getFormInputField('hidden')

    this.input.addEventListener('change', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.onInputChange()
    })

    this.control = this.theme.getFormControl(this.label, this.input, this.description, this.infoButton)
    this.container.appendChild(this.control)
    this.control.appendChild(this.selectInput)
  }

  postBuild() {
    super.postBuild()
    this.initSelect2()
    this.theme.afterInputReady(this.input)
  }

  hasImageExtension(path) {
    if (typeof path !== 'string') {
      throw 'path is not a string!'
    }

    const imageExtensions = ['jpg', 'jpeg', 'gif', 'svg', 'png', 'bmp'].map(ext => ext.toLowerCase())
    const extension = path.split('.').pop().toLowerCase()

    return imageExtensions.includes(extension)
  }

  initSelect2() {
    this.destroySelect2()
    this.searchUrl = this.schema?.searchUrl || '/filemanager/api/search'
    this.streamUrl = this.schema?.streamUrl || '/filemanager/api/stream'

    this.select2instance = $(this.selectInput).select2({
      theme: 'krajee-bs3',
      ajax: {
        cache: true,
        url: this.searchUrl,
        dataType: 'json',
        delay: 250,
        data: (params) => ({
          q: params.term,
          page: params.page || 0 // Send the page number to the server
        }),
        processResults: (data, params) => {
          params.page = params.page || 0

          return {
            results: data.results.map(item => ({
              id: item.fullPath
            })),
            pagination: {
              more: data.pagination.more // Indicate if there are more results https://select2.org/data-sources/ajax#pagination
            }
          }
        }
      },
      error: (jqXHR, textStatus, errorThrown) => {
        console.error('AJAX error:', textStatus, errorThrown)
      },
      placeholder: 'Search for a file...',
      allowClear: true,
      debug: true,
      minimumInputLength: 0,
      templateResult: (item) => {
        if (item.loading) return item.id
        if (this.hasImageExtension(item.id)) {
          return $(`<span><img src='${this.streamUrl}?path=${item.id}' style='max-width: 70px; max-height: 70px;' /> ${item.id}</span>`)
        }
        return $(`<span><i class='fa fa-file' style='font-size: 50px;'></i> ${item.id}</span>`)
      },
      templateSelection: (item) => {
        if (!item.id) {
          return item.text;
        }

        if (item.id && this.hasImageExtension(item.id)) {
          return $(`<span><img src='${this.streamUrl}?path=${item.id}' style='max-width: 20px; max-height: 20px;' /> ${item.id}</span>`)
        }
        return $(`<span><i class='fa fa-file'></i> ${item.id}</span>`)
      },
      escapeMarkup: (markup) => markup
    })

    this.select2instance.on('select2:select', (e) => {
      this.input.value = e.params.data.id
      this.onInputChange()
    })

    this.select2instance.on('select2:clear', (e) => {
      this.input.value = ''
      this.onInputChange()

      setTimeout(() => {
        this.select2instance.select2('close');
      })
    })

    this.setOption(this.input.value)
  }

  setOption(value) {
    const option = new Option(value, value, true, true)
    $(this.selectInput).append(option)
  }

  onInputChange() {
    this.value = this.select2instance.val()

    if (this.value !== '') {
      this.setOption(this.value)
    }

    this.onChange(true)
  }

  destroy() {
    this.destroySelect2()
    if (this.label && this.label.parentNode) this.label.parentNode.removeChild(this.label)
    if (this.description && this.description.parentNode) this.description.parentNode.removeChild(this.description)
    if (this.input && this.input.parentNode) this.input.parentNode.removeChild(this.input)
    super.destroy()
  }

  destroySelect2() {
    if ($(this.input).data('select2')) {
      $(this.input).select2('destroy')
    }
  }
}

JSONEditor.defaults.editors.flysystem = FlysystemEditor

JSONEditor.defaults.resolvers.unshift(function (schema) {
  if (schema.type === 'string' && schema.format === 'flysystem') {
    return 'flysystem'
  }
})
