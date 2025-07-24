<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { Html5Qrcode } from 'html5-qrcode';

    const dispatch = createEventDispatcher();
    let qrboxFunction = (viewfinderWidth, viewfinderHeight) => {
        let minEdge = Math.min(viewfinderWidth, viewfinderHeight);
        let qrboxSize = Math.floor(minEdge * 0.7);
        return {
            width: qrboxSize,
            height: qrboxSize,
        };
    };

    let html5QrCode;

    onMount(() => {
        html5QrCode = new Html5Qrcode("reader");
        startScanner();

        return () => {
            if (html5QrCode && html5QrCode.isScanning) {
                html5QrCode.stop().catch(err => console.error("Failed to stop scanner:", err));
            }
        };
    });

    async function startScanner() {
        try {
            await html5QrCode.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: qrboxFunction,
                },
                (decodedText, decodedResult) => {
                    // success
                    if (html5QrCode && html5QrCode.isScanning) {
                       html5QrCode.stop().catch(err => console.error("Failed to stop scanner on success:", err));
                    }
                    dispatch('scanResult', { data: decodedText });
                },
                (errorMessage) => {
                    // parse error, ignore.
                }
            );
        } catch (err) {
            console.error("Error starting scanner:", err);
            dispatch('scanError', { message: err });
        }
    }

    function closeScanner() {
        dispatch('close');
    }
</script>

<div class="fixed inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center z-50">
    <div id="reader" class="w-full max-w-md bg-gray-800 rounded-lg overflow-hidden"></div>
    <button class="btn btn-error mt-4" on:click={closeScanner}>Cancel Scan</button>
</div>