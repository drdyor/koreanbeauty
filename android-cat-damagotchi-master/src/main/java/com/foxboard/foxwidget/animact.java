package com.foxboard.foxwidget;

import android.app.Activity;

public class animact<T extends Activity> {
    public void finish(T activity, int enter, int exit) {
        activity.overridePendingTransition(enter, exit);
        activity.finish();
    }

    public void onCreate(T activity, int resource, int enter, int exit) {
        activity.overridePendingTransition(enter, exit);
        activity.setContentView(resource);
    }
}
