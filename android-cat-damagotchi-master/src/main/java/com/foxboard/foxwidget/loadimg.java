package com.foxboard.foxwidget;

import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.widget.ImageView;
import java.net.URL;

public class loadimg extends AsyncTask<String, Void, Bitmap> {
    ImageView bmImage;

    public loadimg(ImageView bmImage2) {
        this.bmImage = bmImage2;
    }

    /* access modifiers changed from: protected */
    public Bitmap doInBackground(String... urls) {
        try {
            return BitmapFactory.decodeStream(new URL(urls[0]).openStream());
        } catch (Exception e) {
            return null;
        }
    }

    /* access modifiers changed from: protected */
    public void onPostExecute(Bitmap result) {
        this.bmImage.setImageBitmap(result);
    }
}
