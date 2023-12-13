var applicationServerPublicKey = 'BA91Jp9P_B3iDIKI15-JZ2LSGRZb4abyI-XzShIQSsXxMM3DxNs2nUIh2BpgHOHQQo_z3J2rH2Qxx640j71o0_Q';

$(document).ready(function () {

    navigator.serviceWorker.ready.then(function (reg) {

        if (!reg.pushManager) {
            console.log('Push manager unavailable.')
            return
        }

        var subscribeParams = { userVisibleOnly: true };

        //Setting the public key of our VAPID key pair.
        subscribeParams.applicationServerKey = "BA91Jp9P_B3iDIKI15-JZ2LSGRZb4abyI-XzShIQSsXxMM3DxNs2nUIh2BpgHOHQQo_z3J2rH2Qxx640j71o0_Q";

        var sub = reg.pushManager.getSubscription(subscribeParams)
            .then(function (subscription) {
                isSubscribed = true;

                var p256dh = base64Encode(subscription.getKey('p256dh'));
                var auth = base64Encode(subscription.getKey('auth'));
                //----- post subsciption

                console.log(subscription);

                const res = fetch("http://localhost:9000/notifications/subscribe", {
                    method: 'POST',
                    body: JSON.stringify(subscription),
                    headers: {
                        'Content-Type': 'application/json'
                    }

                })
                    .catch(function (e) {
                        console.log('[subscribe] Unable to subscribe to push', e);
                    });
                console.log(sub);
                if (sub === null) {
                    sub = serviceWorkerReg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: applicationServerPublicKey,
                    });
                }
            });
    })
});
    function base64Encode(arrayBuffer) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    }