package com.foxboard.foxwidget;

import android.annotation.SuppressLint;
import android.content.res.Configuration;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;
import android.os.StrictMode;
import android.support.annotation.RequiresApi;
import android.util.Log;

import static java.lang.Boolean.TRUE;

public class Application extends android.app.Application {
    private static final boolean DEVELOPER_MODE = TRUE;

    /**
     * onCreate() * 액티비티, 리시버, 서비스가 생성되기전 어플리케이션이 시작 중일때 * Application onCreate() 메서드가 만들어 진다고 나와 있습니다. * by. Developer 사이트
     */
    @RequiresApi(api = Build.VERSION_CODES.M)
    @Override
    public void onCreate() {
        super.onCreate();

        if (DEVELOPER_MODE) {
            /* Thread 선택 감시 */
            StrictMode.setThreadPolicy(new StrictMode.ThreadPolicy.Builder()
                    .detectDiskReads()
                    .detectDiskWrites()
                    .detectNetwork()   // or .detectAll() for all detectable problems
                    .penaltyLog()
                    .build());
            /*  Virtual Machine 선택 감시 */
            StrictMode.setVmPolicy(new StrictMode.VmPolicy.Builder()
                    .detectLeakedSqlLiteObjects()
                    .detectLeakedClosableObjects()
                    .penaltyLog()
                    .penaltyDeath()
                    .build());
        }
        Log.e("디버깅 모드", "yes");

    }

    /**
     * onConfigurationChanged() * 컴포넌트가 실행되는 동안 단말의 화면이 바뀌면 시스템이 실행 한다.
     */
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
    }

}
