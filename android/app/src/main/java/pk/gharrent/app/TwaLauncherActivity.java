package pk.gharrent.app;

import android.net.Uri;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

public class TwaLauncherActivity extends LauncherActivity {
    @Override
    protected Uri getLaunchingUrl() {
        Uri incoming = getIntent() != null ? getIntent().getData() : null;
        if (incoming != null && "apnaaghar.pk".equalsIgnoreCase(incoming.getHost())) {
            return incoming;
        }
        return Uri.parse("https://apnaaghar.pk/");
    }
}
