package com.foxboard.foxwidget;

import android.content.Context;
import android.media.AudioManager;
import android.media.SoundPool;
import android.os.Build;
import android.util.Log;

import java.util.HashMap;
import java.util.concurrent.Semaphore;
/**
 * playSound로 사운드 출력
 **/

/**
 * Application단에서 생성하고 static으로 공유됨
 **/
public class SoundManager {
    private SoundPool mSoundPool;
    private HashMap<String, Integer> mSoundPoolMap; //이름, ID
    private AudioManager mAudioManager;
    private Context mContext;
    public static final Semaphore semaphore = new Semaphore(1);

    public SoundManager(Context context) {
        //롤리팝 이상 버전일 경우
        if(Build.VERSION.SDK_INT >=Build.VERSION_CODES.LOLLIPOP){
            this.mSoundPool = new SoundPool.Builder().build();
        }else{
            //롤리팝 이하 버전일 경우
            //new SoundPool(1번, 2번, 3번);
            //1번 - 음악 파일 갯수 //2번 - 스트림 타입 //3번 - 음질
            this.mSoundPool = new SoundPool(1, AudioManager.STREAM_MUSIC, 0);
        }
        this.mContext = context;
        this.mSoundPoolMap = new HashMap<String, Integer>();
        this.mAudioManager = (AudioManager) mContext.getSystemService(Context.AUDIO_SERVICE);

        mSoundPool.setOnLoadCompleteListener(new SoundPool.OnLoadCompleteListener() {
            @Override
            public void onLoadComplete(SoundPool soundPool, int sampleId, int status) {
                semaphore.release(); //세마포어 잠금 해제
            }
        });
    }

    public void addSound(final String name, Integer id) {
        try {
            semaphore.acquire();
        } catch (InterruptedException e) {
            e.printStackTrace();
            Log.e("세마포어","잠김 에러");
        }
        mSoundPoolMap.put(name, mSoundPool.load(mContext, id, 1));
    }

    public void playSound(final String name) { //비동기 쓰레기
        Thread t = new Thread(new Runnable() {
            @Override
            public void run() {
                try {
                    semaphore.acquire();
                    int streamVolume = mAudioManager.getStreamVolume(AudioManager.STREAM_MUSIC);
                    mSoundPool.play(mSoundPoolMap.get(name), streamVolume, streamVolume, 1, 0, 1f);
                } catch (InterruptedException e) {
                    e.printStackTrace();
                    Log.e("세마포어","잠김 에러");
                }finally {
                    semaphore.release();
                }
            }
        });
        t.start();
    }

    public void stopSound(int streamId) {
        mSoundPool.stop(streamId);
    }

    public void pauseSound(int streamId) {
        mSoundPool.pause(streamId);
    }

    public void resumeSound(int streamId) {
        mSoundPool.resume(streamId);
    }

}
