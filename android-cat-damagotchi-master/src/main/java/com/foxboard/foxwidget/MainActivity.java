package com.foxboard.foxwidget;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.graphics.drawable.BitmapDrawable;
import android.net.Uri;
import android.os.Bundle;
import android.view.ContextMenu;
import android.view.Gravity;
import android.view.LayoutInflater;
import android.view.Menu;
import android.view.MenuInflater;
import android.view.MenuItem;
import android.view.View;
import android.view.ViewGroup;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.AdapterView;
import android.widget.ArrayAdapter;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.RelativeLayout;
import android.widget.TextView;
import android.widget.Toast;

import java.util.ArrayList;

public class MainActivity extends Activity implements AdapterView.OnItemClickListener {
    private ArrayAdapter<String> adapter;
    ImageView charactor;
    ListView listviewintro;
    private ArrayList<String> memberlist = new ArrayList<>();
    sharedpref mpref;
    protected int setcharactor = 0;
    TextView textviewintro;
    Intent update = new Intent();
    private static LayoutInflater inflater;
    static Intent pets;
    static Toast toast;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        this.listviewintro = (ListView) findViewById(R.id.listviewintro);
        this.textviewintro = (TextView) findViewById(R.id.textviewintro);
        this.charactor = (ImageView) findViewById(R.id.charactor);
        this.memberlist.add("기본 캐릭터");
        this.memberlist.add("추가 다운로드");
        this.memberlist.add("개발 정보");
        this.memberlist.add("위젯 종료");
        this.adapter = new ArrayAdapter(this, android.R.layout.simple_list_item_1, this.memberlist);
        this.listviewintro.setAdapter((ListAdapter) this.adapter);
        this.listviewintro.setOnItemClickListener(this);
        RelativeLayout main_layout = findViewById(R.id.main_layout);
        registerForContextMenu(main_layout);
        this.mpref = sharedpref.getInstance(this);
        this.update.setComponent(new ComponentName("com.foxboard.foxwidget", "com.foxboard.foxwidget.update"));
    }

    @Override
    public void onCreateContextMenu(ContextMenu menu, View v, ContextMenu.ContextMenuInfo menuInfo) {
        super.onCreateContextMenu(menu, v, menuInfo);
        MenuInflater inflater = getMenuInflater();
        inflater.inflate(R.menu.context_test, menu);
    }

    public boolean onContextItemSelected(MenuItem item)
    {
        switch(item.getItemId())
        {
            case R.id.menu1:
                Toast.makeText(this,"테스트1.", Toast.LENGTH_SHORT).show();
                return true;
            case R.id.menu2:
                Toast.makeText(this,"테스트2.", Toast.LENGTH_SHORT).show();
                return true;
        }
        return super.onContextItemSelected(item);
    }

    @Override // android.widget.AdapterView.OnItemClickListener
    public void onItemClick(AdapterView<?> adapterView, View view, int position, long id) {
        pets = new Intent(this, petService.class);
        switch (position) {
            case 0:
                this.mpref.setPref(0); //설정 기록
                AlertDialog.Builder dlg = new AlertDialog.Builder(MainActivity.this);
                dlg.setTitle("안내"); //제목
                dlg.setMessage("미동작 시 다른 앱 위에 그리기를 활성화 해주세요."); // 메시지
                dlg.setIcon(new BitmapDrawable(getResources(), new ResizeImg(this).convertimg(R.drawable.introimg,40,40))); // 아이콘 설정
                dlg.setPositiveButton("확인",new DialogInterface.OnClickListener(){
                    public void onClick(DialogInterface dialog, int which) {
                        Toast.makeText(MainActivity.this,"행복한 하루 보내세요~",Toast.LENGTH_SHORT).show();
                    }
                });
                dlg.show();
                startService(pets);
                break;
            case 1:
                startService(this.update);
                break;
            case 2:
                View customToast = inflater.inflate(R.layout.customtoast, (ViewGroup)findViewById(R.id.customtoast));
                toast = new Toast(this);
                toast.setGravity(Gravity.CENTER_HORIZONTAL | Gravity.BOTTOM,0,0);
                toast.setDuration(Toast.LENGTH_SHORT);
                toast.setView(customToast);
                toast.show();
                startActivity(new Intent(this, License.class));
                break;
            case 3:
                stopService(pets);
                System.exit(0);
                break;
            default:
                break;
        }
    }

    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main, menu);
        return true;
    }

    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            inflater = getLayoutInflater();
            new loadimg(this.charactor).execute("https://pbs.twimg.com/media/EowJzePU0AEa2F7?format=png&name=900x900");

        }
    }
}
