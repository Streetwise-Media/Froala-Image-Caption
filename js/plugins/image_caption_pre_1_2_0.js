/*!
 * Froala Image Caption Plugin
 * Written by Matt Dziuban (http://mattdziuban.com)
 * Works with versions of Froala < v1.2.0 (http://editor.froala.com)
 */
(function ($) {
  $.Editable.DEFAULTS = $.extend($.Editable.DEFAULTS, {
    imageCaption: true,
    imageResizeCallback: function(e) {
      var $imgEditor = $('.f-img-editor');
      if ($imgEditor.closest('.thumbnail').length == 0)
        return;
      $imgEditor.closest('.thumbnail').find('.caption').css('width', ($imgEditor.find('img').attr('width')-18)+'px');
    },
    insertImageCallback: function(imageUrl) {
      $.each(this.$element.find('img[src="'+imageUrl+'"]'), function(i, img) {
        var $img = $(img);
        if (!$img.hasClass('fr-fin') && !$img.hasClass('fr-fir') && !$img.hasClass('fr-fil'))
          $img.addClass('fr-fin');
      });
    }
  });

  $.Editable.VALID_NODES = $.merge($.Editable.VALID_NODES, ['FIGURE','FIGCAPTION']);

  $.Editable.prototype.getImageClass = function (cls) {
    if (!cls)
      return 'fr-fin';
    var classes = cls.split(' ');
    if (classes.indexOf('fr-fir') >= 0)
      return 'fr-fir';
    if (classes.indexOf('fr-fil') >= 0)
      return 'fr-fil';
    return 'fr-fin';
  };

  $.Editable.prototype.initImageCaptionEvents = function() {
    var that = this;
    this.$element.on('click touchend', 'img:not([contenteditable="false"])', function(e) {
      if ($(this).closest('.thumbnail').length > 0)
        var caption = $(this).closest('.thumbnail').find('.caption').html();
      else
        var caption = '';
      that.$image_editor.find('.f-image-caption textarea').val(caption);
      var $image_wrap = that.$element.find('.f-img-editor');
      $image_wrap.removeClass('fr-fin fr-fir fr-fil').addClass(that.getImageClass($image_wrap.find('img').attr('class')));
    });
  };

  $.Editable.prototype.addImageClass = function($obj, cls) {
    $obj.removeClass('fr-fin fr-fir fr-fil').addClass(cls);
    if (!this.options.imageCaption)
      return;
    if ($obj.closest('.thumbnail').length > 0) {
      $obj.closest('.thumbnail').removeClass('fr-fin fr-fir fr-fil').addClass(cls);
      $obj.closest('.thumbnail').find('.caption').css('width', ($obj.attr('width')-18)+'px')
    }
  };

  $.Editable.prototype.addCaptionField = function() {
    var that = this;
    $('<div class="f-popup-line f-image-caption">')
        .append('<label><span data-text="true">Caption</span>: </label>')
        .append($('<textarea class="caption-input"></textarea>').on('mouseup keydown', function(e) {
          var keyCode = e.which;
          if (!keyCode || keyCode !== 27)
            e.stopPropagation();
        }))
        .append($('<button class="f-ok" style="float:right!important;" title="OK">OK</button>').on('mouseup touchend', function() {
          that.setImageCaption();
        }))
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
  $.Editable.prototype.removeImage = function() {
    if (!this.options.imageCaption)
      return originalRemoveImage.call(this);
    var $image_editor = this.$element.find('span.f-img-editor'),
      message = 'Are you sure? Image will be deleted.';
    if ($.Editable.LANGS[this.options.language]) {
      message = $.Editable.LANGS[this.options.language].translation[message];
    }
    if (!confirm(message))
      return $image_editor.find('img').click();
    if ($image_editor.length === 0) return false;
    var $img_parent = $image_editor.parents('.thumbnail');
    originalRemoveImage.call(this);
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
        var captionHtml = '<div class="post-caption-container"><figure class="'+classes+'">'+$image.get(0).outerHTML
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
    this.options.imageMove = false;
    this.options.imageDeleteConfirmation = false;
    this.initImageCaptionEvents();
    this.addCaptionField();
    this.bindKeyboardCaptionDeletionHandler();
  };

  var originalFloatImageLeft = $.Editable.prototype.floatImageLeft;
  $.Editable.prototype.floatImageLeft = function($image_editor) {
    this.addImageClass($image_editor, 'fr-fil');
    this.addImageClass($image_editor.find('img'), 'fr-fil');
    originalFloatImageLeft.call(this, $image_editor);
  };

  var originalFloatImageNone = $.Editable.prototype.floatImageNone;
  $.Editable.prototype.floatImageNone = function($image_editor) {
    this.addImageClass($image_editor, 'fr-fin');
    this.addImageClass($image_editor.find('img'), 'fr-fin');
    originalFloatImageNone.call(this, $image_editor);
  };

  var originalFloatImageRight = $.Editable.prototype.floatImageRight;
  $.Editable.prototype.floatImageRight = function($image_editor) {
    this.addImageClass($image_editor, 'fr-fir');
    this.addImageClass($image_editor.find('img'), 'fr-fir');
    originalFloatImageRight.call(this, $image_editor);
  };

  var originalContinueInit = $.Editable.prototype.continueInit;
  $.Editable.prototype.continueInit = function() {
    originalContinueInit.call(this);
    this.initCaptions();
  };
})(jQuery);
