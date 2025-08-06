package com.ultimatehealth

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.SystemClock
import android.util.Log
import androidx.core.app.ActivityCompat
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.modules.core.DeviceEventManagerModule
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream

@ReactModule(name = "WavAudioRecorder")
class WavAudioRecorderModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val TAG = "WavAudioRecorder"
    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var filePath: String? = null
    private var recordThread: Thread? = null
    private val sampleRate = 44100
    private val numChannels = 1
    private val byteDepth = 2 // 16-bit
    private val bufferSize = AudioRecord.getMinBufferSize(
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT
    ) * 2

    private var startTime: Long = 0L
    private val tempPcmFile = File(reactContext.cacheDir, "temp_recording.pcm")
    private val wavFile = File(reactContext.cacheDir, "recorded_audio.wav")

    override fun getName(): String = "WavAudioRecorder"

    @ReactMethod
    fun startRecording(promise: Promise) {
        if (isRecording) {
            promise.reject("ALREADY_RECORDING", "Recording is already in progress.")
            return
        }

        val activity = reactApplicationContext.currentActivity

        if (activity == null || ActivityCompat.checkSelfPermission(
                activity,
                Manifest.permission.RECORD_AUDIO
            ) != PackageManager.PERMISSION_GRANTED
        ) {
            Log.e(TAG, "RECORD_AUDIO permission not granted.")
            promise.reject("PERMISSION_DENIED", "RECORD_AUDIO permission not granted")
            return
        }
        audioRecord = AudioRecord(
            MediaRecorder.AudioSource.MIC,
            sampleRate,
            AudioFormat.CHANNEL_IN_MONO,
            AudioFormat.ENCODING_PCM_16BIT,
            bufferSize
        )

        if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
            promise.reject("INIT_ERROR", "AudioRecord initialization failed.")
            return
        }

        isRecording = true
        startTime = SystemClock.elapsedRealtime()
        audioRecord?.startRecording()

        recordThread = Thread {
            FileOutputStream(tempPcmFile).use { out ->
                val buffer = ByteArray(bufferSize)
                while (isRecording) {
                    val read = audioRecord!!.read(buffer, 0, buffer.size)
                    if (read > 0) out.write(buffer, 0, read)

                    //  send metering update
                    val elapsed = SystemClock.elapsedRealtime() - startTime
                    sendEvent("recUpdate", Arguments.createMap().apply {
                        putDouble("elapsedMs", elapsed.toDouble())
                    })

                    Thread.sleep(500)
                }
            }

            saveAsWav()
            sendEvent("recStop", Arguments.createMap().apply {
                putString("filePath", wavFile.absolutePath)
            })
        }

        recordThread!!.start()
        promise.resolve(null)
    }

    @ReactMethod
    fun stopRecording(promise: Promise) {
        if (!isRecording) {
            promise.reject("NOT_RECORDING", "No active recording.")
            return
        }

        isRecording = false
        audioRecord?.stop()
        audioRecord?.release()
        audioRecord = null

        recordThread?.join()
        promise.resolve(Arguments.createMap().apply {
            putString("filePath", wavFile.absolutePath)
        })
    }

    private fun saveAsWav() {
        val numDataBytes = tempPcmFile.length()
        val header = buildWavHeader(numDataBytes)
        FileOutputStream(wavFile).use { wavOut ->
            wavOut.write(header)
            FileInputStream(tempPcmFile).copyTo(wavOut)
        }
        tempPcmFile.delete()
    }

    private fun buildWavHeader(pcmSize: Long): ByteArray {
        val totalSize = pcmSize + 36
        val byteRate = sampleRate * numChannels * byteDepth
        val header = ByteArray(44)

        // RIFF header
        header[0] = 'R'.code.toByte(); header[1] = 'I'.code.toByte()
        header[2] = 'F'.code.toByte(); header[3] = 'F'.code.toByte()
        header[4] = (totalSize and 0xff).toByte()
        header[5] = ((totalSize shr 8) and 0xff).toByte()
        header[6] = ((totalSize shr 16) and 0xff).toByte()
        header[7] = ((totalSize shr 24) and 0xff).toByte()
        header[8] = 'W'.code.toByte(); header[9] = 'A'.code.toByte()
        header[10] = 'V'.code.toByte(); header[11] = 'E'.code.toByte()

        // fmt chunk
        header[12] = 'f'.code.toByte(); header[13] = 'm'.code.toByte()
        header[14] = 't'.code.toByte(); header[15] = ' '.code.toByte()
        header[16] = 16; header[17] = 0; header[18] = 0; header[19] = 0
        header[20] = 1; header[21] = 0 // PCM
        header[22] = numChannels.toByte(); header[23] = 0
        header[24] = (sampleRate and 0xff).toByte()
        header[25] = ((sampleRate shr 8) and 0xff).toByte()
        header[26] = ((sampleRate shr 16) and 0xff).toByte()
        header[27] = ((sampleRate shr 24) and 0xff).toByte()
        header[28] = (byteRate and 0xff).toByte()
        header[29] = ((byteRate shr 8) and 0xff).toByte()
        header[30] = ((byteRate shr 16) and 0xff).toByte()
        header[31] = ((byteRate shr 24) and 0xff).toByte()
        header[32] = (numChannels * byteDepth).toByte(); header[33] = 0
        header[34] = (byteDepth * 8).toByte(); header[35] = 0

        // data chunk
        header[36] = 'd'.code.toByte(); header[37] = 'a'.code.toByte()
        header[38] = 't'.code.toByte(); header[39] = 'a'.code.toByte()
        header[40] = (pcmSize and 0xff).toByte()
        header[41] = ((pcmSize shr 8) and 0xff).toByte()
        header[42] = ((pcmSize shr 16) and 0xff).toByte()
        header[43] = ((pcmSize shr 24) and 0xff).toByte()

        return header
    }

    private fun sendEvent(name: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }
}
