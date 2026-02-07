package com.foxboard.foxwidget;

import android.content.Context;
import android.content.SharedPreferences;

public class sharedpref {
    public static sharedpref minstance;
    private SharedPreferences pref;
    private SharedPreferences.Editor editor;

    private sharedpref(Context context) {
        this.pref = context.getSharedPreferences("pref", Context.MODE_PRIVATE);
        editor = this.pref.edit();
    }

    protected static sharedpref getInstance(Context context) {
        if (minstance == null) {
            minstance = new sharedpref(context);
        }
        return minstance;
    }

    public int getPref() {
        return this.pref.getInt("pref", 0);
    }

    public void setPref(int num) {
        this.editor.putInt("pref", num);
        this.editor.apply();
    }

    public void removePref() {
        this.editor.remove("pref");
        this.editor.apply();
    }

    public void removeAllPref() {
        this.editor.clear();
        this.editor.apply();
    }
}
