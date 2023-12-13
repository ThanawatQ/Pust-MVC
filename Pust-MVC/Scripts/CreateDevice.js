var applicationServerPublicKey = 'BA91Jp9P_B3iDIKI15-JZ2LSGRZb4abyI-XzShIQSsXxMM3DxNs2nUIh2BpgHOHQQo_z3J2rH2Qxx640j71o0_Q';
var swJs = '/scripts/sw.js';
var isSubscribed = false;

$(document).ready(function () {
    // Application Server Public Key defined in Views/Device/Create.cshtml
    if (typeof applicationServerPublicKey === 'undefined') {
        errorHandler('Vapid public key is undefined.');
        return;
    }

    Notification.requestPermission().then(function (status) {
        if (status === 'denied') {
            errorHandler('[Notification.requestPermission] Browser denied permissions to notification api.');
        } else if (status === 'granted') {
            console.log('[Notification.requestPermission] Initializing service worker.');
            initialiseServiceWorker();
        }
    });

    subscribe();
});
function checkSubscriptionStatus() {
    navigator.serviceWorker.ready
        .then(function (registration) {
            console.log('User is already subscribed to push notifications');

            return registration.pushManager.getSubscription();
        })
        .then(function (subscription) {
            isSubscribed = !!subscription;
            if (isSubscribed) {
                console.log('User is already subscribed to push notifications');
            } else {
                console.log('User is not yet subscribed to push notifications');
            }
        })
        .catch(function (err) {
            console.log('[checkSubscriptionStatus] Unable to get subscription details.', err);
        });
}

function initialiseServiceWorker() {


    if ('serviceWorker' in navigator) {
       
        navigator.serviceWorker.getRegistration().then((registration) => {
            if (registration) {
                registration.unregister().then((success) => {
                   // console.log('Service Worker unregistered:', registration);
                    // Now register the new service worker
                    navigator.serviceWorker.register(swJs, {
                        scope: '/scripts/',
                    }).then(handleSWRegistration);

                });
            } else {
                // No existing service worker, register the new one
                navigator.serviceWorker.register(swJs, {
                    scope: '/scripts/',
                }).then(handleSWRegistration);
            }

        }).catch((error) => {
            console.log('initialiseServiceWorker. catch', err);
        });
    }
    else {
        errorHandler('[initialiseServiceWorker] Service workers are not supported in this browser.');
    }
}
function handleSWRegistration(reg) {

        if (reg.installing) {
            console.log('Service worker installing');
        } else if (reg.waiting) {
            console.log('Service worker installed');
        } else if (reg.active) {
            console.log('Service worker active');
        }

        initialiseState(reg);
    }

    // Once the service worker is registered set the initial state
    function initialiseState(reg) {
        // Are Notifications supported in the service worker?
        if (!(reg.showNotification)) {
            errorHandler('[initialiseState] Notifications aren\'t supported on service workers.');
            return;
        }

        // Check if push messaging is supported
        if (!('PushManager' in window)) {
            errorHandler('[initialiseState] Push messaging isn\'t supported.');
            return;
        }

        // We need the service worker registration to check for a subscription

        navigator.serviceWorker.ready.then(function (reg) {
            // Do we already have a push message subscription?
            reg.pushManager.getSubscription()
                .then(function (subscription) {
                    isSubscribed = subscription;
                    if (isSubscribed) {
                        console.log('User is already subscribed to push notifications');
                    } else {
                        console.log('User is not yet subscribed to push notifications');
                    }
                })
                .catch(function (err) {
                    console.log('[req.pushManager.getSubscription] Unable to get subscription details.', err);
                });
        });
    }

    function subscribe() {

        navigator.serviceWorker.ready.then(function (reg) {

            if (!reg.pushManager) {
                console.log('Push manager unavailable.')
                return
            }

            var subscribeParams = { userVisibleOnly: true };

            //Setting the public key of our VAPID key pair.
            var applicationServerKey = urlB64ToUint8Array(applicationServerPublicKey);
            subscribeParams.applicationServerKey = applicationServerKey;

            var sub =   reg.pushManager.getSubscription(subscribeParams)
                .then(function (subscription) {
                    isSubscribed = true;

                    var p256dh =  base64Encode(subscription.getKey('p256dh'));
                    var auth = base64Encode(subscription.getKey('auth'));
                    //----- post subsciption

                    console.log(subscription);

                    const res = sendSubscription()
                    console.log(res.body)

                })
                .catch(function (e) {
                    errorHandler('[subscribe] Unable to subscribe to push', e);
                });
            console.log(sub);
            if (sub === null) {
                sub =  serviceWorkerReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: applicationServerPublicKey,
                });
            }
        });
    }

    function sendSubscription(subscription) {
        console.log("SubDetail", subscription)
        return fetch("http://localhost:44374/api/Notifications/notification/subscribe", {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
    function errorHandler(message, e) {
        if (typeof e == 'undefined') {
            e = null;
        }

        console.error(message, e);
        $("#errorMessage").append('<li>' + message + '</li>').parent().show();
    }

   function urlB64ToUint8Array(base64String) {
        var padding = '='.repeat((4 - base64String.length % 4) % 4);
        var base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        var rawData = window.atob(base64);
        var outputArray = new Uint8Array(rawData.length);

        for (var i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

  function base64Encode(arrayBuffer) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(arrayBuffer)));
    }