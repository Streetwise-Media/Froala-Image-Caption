# Froala Image Caption Plugin

This plugin allows you to easily add caption to images when editing with the Froala WYSIWYG editor. To get started, just register image_caption.js and image_caption.css:

```
<!-- Register Froala and FontAwesome CSS here -->
<link rel="stylesheet" type="text/css" href="css/image_caption.css">
<!-- Register jQuery and Froala editor JavaScript here -->
<script src="js/plugins/image_caption.js"></script>
```

After uploading an image, the image editor will look like this:

![Image editor with caption field](http://i.imgur.com/QHZTeHW.png)

After setting a caption and clicking "OK," your image will look like this in the editor:

![Image with caption](http://i.imgur.com/pSQPeTX.png)

Features include:
- Resizing of the caption/thumbnail container when resizing the image
- Ability to delete the caption by setting the text empty in the image editor or by deleting the caption text itself in the editor
- Ability to disable the image caption plugin by setting `imageCaption: false` when initializing the editor
	- This is useful when there is more than one editor instance on one page

NOTE: If you're using a version of Froala below v1.2.0, use the *_pre_1_2_0 versions of the JS and CSS files.
