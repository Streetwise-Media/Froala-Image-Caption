/*!
 * Froala Image Caption Plugin
 * Written by Matt Dziuban (http://mattdziuban.com)
 * Tested with Froala v1.2.3 - v1.2.6 (http://editor.froala.com)
 */
(function ($) {
  $.Editable.DEFAULTS = $.extend($.Editable.DEFAULTS, {
    imageCaption: true
  });

  $.Editable.VALID_NODES = $.merge($.Editable.VALID_NODES, ['FIGURE','FIGCAPTION']);

  $.Editable.prototype.initImageCaptionEvents = function() {
    var that = this;
    this.$element.on('click touchend', 'img:not([contenteditable="false"])', function(e) {
      if ($(this).closest('.thumbnail').length > 0)
        var caption = $(this).closest('.thumbnail').find('.caption').html();
      else
        var caption = '';
      that.$image_editor.find('.f-image-caption textarea').val(caption);
    });
    this.$element.on('drop', function(e) {
      var $img = that.$element.find('.fr-image-dropped');
      if ($img.length == 0 || !$img.attr('data-ref-id') || $($img.data('ref-id')).length == 0)
        return;
      var $captionContainer = $($img.data('ref-id'));
      $captionContainer.remove();
      $captionContainer.find('img').remove();
      $captionContainer.find('.thumbnail').prepend($img.get(0).outerHTML);
      $img.replaceWith($captionContainer);
    });
  };

  var originalAddImageClass = $.Editable.prototype.addImageClass;
  $.Editable.prototype.addImageClass = function($obj, cls) {
    originalAddImageClass($obj, cls);
    if (!this.options.imageCaption)
      return;
    if ($obj.closest('.thumbnail').length > 0) {
      originalAddImageClass($obj.closest('.thumbnail'), cls);
      $obj.closest('.thumbnail').find('.caption').css('width', ($obj.attr('width')-18)+'px')
    }
  };

  $.Editable.prototype.addCaptionField = function() {
    $('<div class="f-popup-line f-image-caption">')
        .append('<label><span data-text="true">Caption</span>: </label>')
        .append($('<textarea class="caption-input"></textarea>').on('mouseup keydown', function(e) {
          var keyCode = e.which;
          if (!keyCode || keyCode !== 27)
            e.stopPropagation();
        }))
        .append('<button class="f-ok" style="float:right!important;" data-text="true" data-callback="setImageCaption" data-cmd="setImageCaption title="OK">OK</button>')
        .appendTo(this.$image_editor);
  };

  $.Editable.prototype.bindKeyboardCaptionDeletionHandler = function() {
    $('.froala-element').on('keydown', function(e) {
      if (e.keyCode == 8 || e.keyCode == 46) {
        $(this).find('.thumbnail .caption').each(function(i, caption) {
          if ($.trim($(caption).text()) === '') {
            var $img = $(caption).closest('.thumbnail').find('img');
            $(caption).closest('.thumbnail').replaceWith('<p>'+$img.get(0).outerHTML+'</p>');
          }
        });
      }
    });
  };

  var originalRemoveImage = $.Editable.prototype.removeImage;
  $.Editable.prototype.removeImage = function($img) {
    if (!this.options.imageCaption)
      return originalRemoveImage.call(this, $img);
    var $image_editor = this.$element.find('span.f-img-editor'),
      message = 'Are you sure? Image will be deleted.';
    if ($.Editable.LANGS[this.options.language]) {
      message = $.Editable.LANGS[this.options.language].translation[message];
    }
    if (!confirm(message))
      return $image_editor.find('img').click();
    if ($image_editor.length === 0) return false;
    var $img_parent = $image_editor.parents('.thumbnail');
    originalRemoveImage.call(this, $img);
    if ($img_parent.length > 0)
      $img_parent.eq(0).remove();
  };

  $.Editable.prototype.setImageCaption = function() {
    var $image = this.$element.find('span.f-img-editor img'),
      captionText = this.$image_editor.find('.f-image-caption textarea').val();
    this.hide();
    this.closeImageMode();
    if ($.trim(captionText) === '') {
      if ($image.closest('.thumbnail').length > 0)
        $image.closest('.thumbnail').replaceWith('<p>'+$image.get(0).outerHTML+'</p>');
    } else {
      if ($image.closest('.thumbnail').length > 0)
        $image.closest('.thumbnail').find('.caption').text(captionText);
      else {
        var classes = 'thumbnail clearfix '+this.getImageClass($image.attr('class'));
        var refId = 'img-'+(new Date()).getTime();
        var captionHtml = '<div class="post-caption-container" id="'+refId+'"><figure class="'+classes+'">'+$image.attr('data-ref-id', '#'+refId).get(0).outerHTML
          +'<figcaption class="caption pull-center" contenteditable="false" style="width:'+($image.attr('width')-18)+'px">'+captionText
          +'</figcaption></figure></div>';
        if ($image.parent().children().length > 1)
          $image.replaceWith(captionHtml);
        else
          $image.parent().replaceWith(captionHtml);
      }
    }
  };

  $.Editable.prototype.initCaptions = function() {
    if (!this.options.imageCaption)
      return;
    this.options.imageDeleteConfirmation = false;
    this.initImageCaptionEvents();
    this.addCaptionField();
    this.bindKeyboardCaptionDeletionHandler();
    this.$original_element.on('editable.imageResize', function(e) {
      var $imgEditor = $('.f-img-editor');
      if ($imgEditor.closest('.thumbnail').length == 0)
        return;
      $imgEditor.closest('.thumbnail').find('.caption').css('width', ($imgEditor.find('img').attr('width')-18)+'px');
    });
  };

  $.Editable.initializers.push($.Editable.prototype.initCaptions);
})(jQuery);
