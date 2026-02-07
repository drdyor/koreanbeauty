package com.foxboard.foxwidget;

import android.app.IntentService;
import android.content.Intent;
import android.os.Handler;
import android.os.Looper;
import android.widget.Toast;

public class update extends IntentService {
    public update() {
        super(update.class.getName());
        setIntentRedelivery(true);
    }

    /* access modifiers changed from: protected */
    public void onHandleIntent(Intent intent) {
        new Handler(Looper.getMainLooper()).post(new Runnable() {
            /* class com.foxboard.foxwidget.update.AnonymousClass1 */

            public void run() {
                Toast.makeText(update.this.getApplicationContext(), "추후 지원할 예정입니다..", Toast.LENGTH_SHORT).show();
            }
        });
    }
}
