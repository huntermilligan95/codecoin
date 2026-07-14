package dev.hunterclaw.chillflix;

import android.net.Uri;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeWebViewClient;
import java.io.ByteArrayInputStream;

/**
 * Extends Capacitor's default WebViewClient with a lightweight in-app ad
 * blocker. Free video-embed aggregators (vidsrc, videasy, multiembed, etc.)
 * commonly inject ad-network subresources and try to hijack the page with
 * full-screen redirects when the user taps the player. This client:
 *
 *  1. Drops any network request to a known ad/tracker domain
 *     (shouldInterceptRequest) — blocks banner/interstitial ad payloads,
 *     tracking pixels, and injected ad scripts before they ever load.
 *
 *  2. Blocks the *main frame* from navigating away to a domain outside the
 *     app + the known embed-player domains (shouldOverrideUrlLoading) —
 *     this is what stops "tap play -> whole app redirects to a casino/ad
 *     site" popups. Subframe (iframe) navigation is left alone except for
 *     known ad hosts, since the embed players legitimately redirect between
 *     many different video CDN domains to serve the actual stream.
 */
public class AdBlockWebViewClient extends BridgeWebViewClient {

    // Known ad/tracker network domains — matches server.js AD_PATTERNS plus
    // common popunder/redirect networks seen on free streaming embeds.
    private static final String[] AD_HOST_PATTERNS = {
        "doubleclick.net", "googlesyndication.com", "googleadservices.com",
        "google-analytics.com", "googletagmanager.com", "googletagservices.com",
        "adnxs.com", "amazon-adsystem.com", "taboola.com", "outbrain.com",
        "popads.net", "popcash.net", "propellerads.com", "mgid.com",
        "revcontent.com", "trafficjunky.net", "exoclick.com", "juicyads.com",
        "adsterra.com", "hilltopads.net", "bidvertiser.com", "adform.net",
        "criteo.com", "pubmatic.com", "rubiconproject.com", "openx.net",
        "appnexus.com", "adsrvr.org", "advertising.com", "adblade.com",
        "adroll.com", "adtech.de", "smartadserver.com", "33across.com",
        "sovrn.com", "triplelift.com", "sharethrough.com",
        "clickadu.com", "adcash.com", "monetizemore.com", "adskeeper.co.uk",
        "pushnami.com", "onclickmega.com", "adsco.re", "smartyads.com",
        "yllix.com", "adsterratech.com", "shrinkme.io", "clkmein.com",
        "coinzilla.com", "a-ads.com", "bmtm.io", "propellerclick.com",
    };

    // Domains this app allows the *entire* WebView to navigate to.
    // Anything else attempting a top-level (main frame) navigation is
    // treated as a redirect/popup ad and blocked.
    private static final String[] NAV_ALLOW_SUFFIXES = {
        "chillflix.hunterclaw.dev",
        "player.videasy.net",
        "vidsrc.to",
        "multiembed.mov",
        "vidsrc.cc",
        "embed.su",
    };

    public AdBlockWebViewClient(Bridge bridge) {
        super(bridge);
    }

    @Override
    public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) {
        String host = request.getUrl().getHost();
        if (host != null && isAdHost(host)) {
            return new WebResourceResponse("text/plain", "utf-8", new ByteArrayInputStream(new byte[0]));
        }
        return super.shouldInterceptRequest(view, request);
    }

    @Override
    public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
        Uri url = request.getUrl();
        String host = url.getHost();

        if (host != null && isAdHost(host)) {
            // Never navigate to a known ad/tracker domain, main frame or subframe.
            return true;
        }

        if (request.isForMainFrame() && host != null && !isNavAllowed(host)) {
            // Block the whole app from being hijacked to an unrelated site.
            return true;
        }

        return super.shouldOverrideUrlLoading(view, request);
    }

    private boolean isAdHost(String host) {
        String h = host.toLowerCase();
        for (String pattern : AD_HOST_PATTERNS) {
            if (h.contains(pattern)) return true;
        }
        return false;
    }

    private boolean isNavAllowed(String host) {
        String h = host.toLowerCase();
        for (String suffix : NAV_ALLOW_SUFFIXES) {
            if (h.equals(suffix) || h.endsWith("." + suffix)) return true;
        }
        return false;
    }
}
