package com.example.app;

import android.net.Uri;
import android.os.Build;
import android.util.Log;
import android.webkit.ServiceWorkerClient;
import android.webkit.ServiceWorkerController;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;

import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.webkit.ServiceWorkerClientCompat;
import androidx.webkit.ServiceWorkerControllerCompat;

import com.getcapacitor.Plugin;
import com.getcapacitor.annotation.CapacitorPlugin;

import java.net.URI;
import java.util.Map;

@CapacitorPlugin
public class ServiceWorkerPlugin extends Plugin {

    @RequiresApi(api = Build.VERSION_CODES.N)
    @Override
    public void load() {
        
        ServiceWorkerControllerCompat swController = ServiceWorkerControllerCompat.getInstance();

        swController.setServiceWorkerClient(new ServiceWorkerClientCompat() {
            @Override
            public WebResourceResponse shouldInterceptRequest(@NonNull WebResourceRequest request) {
                Uri url = request.getUrl();
                WebResourceResponse shouldIntercept = bridge.getLocalServer().shouldInterceptRequest(request);
                return shouldIntercept;
            }
        });
    }

}