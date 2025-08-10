package com.ultimatehealth

import android.Manifest
import android.content.pm.PackageManager
import android.media.AudioFormat
import android.os.Environment
import java.nio.ByteBuffer
import java.nio.ByteOrder


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
    private val uniqueId = System.currentTimeMillis().toString() + "_" + hashCode()
    private val externalDir = reactApplicationContext.getExternalFilesDir(Environment.DIRECTORY_MUSIC)
    private val tempPcmFile = File(externalDir, "temp_recording_${uniqueId}.pcm")
    private val wavFile = File(externalDir, "recorded_audio_${uniqueId}.wav")

    override fun getName(): String = "WavAudioRecorder"

    override fun getConstants(): Map<String, Any> {
    return mapOf("onAudioWaveform" to "onAudioWaveform")
    }

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

    /***
    recordThread = Thread {
        try {
            FileOutputStream(tempPcmFile).use { out ->
                val buffer = ByteArray(bufferSize)
                val shortBuffer = ShortArray(bufferSize / 2)
                while (isRecording) {
                   val read = audioRecord!!.read(shortBuffer, 0, shortBuffer.size)
                   
                   if (read > 0) {
                     val byteBuf = ByteBuffer.allocate(read * 2)
                                   .order(ByteOrder.LITTLE_ENDIAN)
                     byteBuf.asShortBuffer().put(shortBuffer, 0, read)
                     out.write(byteBuf.array())
                  }

                    // To calculate RMS value, for visualization, Audio wave form feature
                    val max = buffer.maxOrNull()?.toInt() ?: 0
                    val normalized = (max.toFloat() / Short.MAX_VALUE)

                    val params = Arguments.createMap()
                    params.putDouble("amplitude", normalized.toDouble())

                    sendEvent("onAudioWaveform", params);
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

        } catch (e: Exception) {
            Log.e(TAG, "Recording error: ${e.localizedMessage}", e)
            promise.reject("RECORD_ERROR", e.localizedMessage, e)
        }
    }
    */

    recordThread = Thread {
          try {
            FileOutputStream(tempPcmFile).use { out ->
            val buffer = ByteArray(bufferSize)
            val shortBuffer = ShortArray(bufferSize / 2)
            while (isRecording) {
                val read = audioRecord!!.read(shortBuffer, 0, shortBuffer.size)

                if (read > 0) {
                    val byteBuf = ByteBuffer.allocate(read * 2)
                        .order(ByteOrder.LITTLE_ENDIAN)
                    byteBuf.asShortBuffer().put(shortBuffer, 0, read)
                    out.write(byteBuf.array())

                    // Calculate RMS amplitude for visualization
                    var sum = 0.0
                    for (i in 0 until read) {
                        sum += shortBuffer[i] * shortBuffer[i]
                    }
                    val rms = if (read > 0) Math.sqrt(sum / read) else 0.0
                    val normalized = rms / Short.MAX_VALUE

                    val params = Arguments.createMap()
                    params.putDouble("amplitude", normalized)

                    sendEvent("onAudioWaveform", params)
                }

                val elapsed = SystemClock.elapsedRealtime() - startTime
                sendEvent("recUpdate", Arguments.createMap().apply {
                    putDouble("elapsedMs", elapsed.toDouble())
                })

                Thread.sleep(50)
            }
        }

        saveAsWav()

        sendEvent("recStop", Arguments.createMap().apply {
            putString("filePath", wavFile.absolutePath)
        })

    } catch (e: Exception) {
        Log.e(TAG, "Recording error: ${e.localizedMessage}", e)
        promise.reject("RECORD_ERROR", e.localizedMessage, e)
    }
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

    try {
        audioRecord?.apply {
            stop()
            release()
        }
        audioRecord = null

        // Wait for the recording thread to finish
        recordThread?.join()

        // Safely return the final file path
        val result = Arguments.createMap().apply {
            putString("filePath", wavFile.absolutePath)
        }
        promise.resolve(result)
    } catch (e: Exception) {
        Log.e(TAG, "Error stopping recording", e)
        promise.reject("STOP_FAILED", "Failed to stop recording: ${e.message}")
    }
}


   private fun saveAsWav() {
    try {
        val numDataBytes = tempPcmFile.length()
        if (!tempPcmFile.exists() || numDataBytes <= 0) {
            Log.e(TAG, " PCM file missing or empty")
            return
        }

        Log.d(TAG, "Saving WAV. PCM Size: $numDataBytes")

        val header = buildWavHeader(numDataBytes)

        FileOutputStream(wavFile).use { wavOut ->
            wavOut.write(header)
            FileInputStream(tempPcmFile).copyTo(wavOut)
            wavOut.flush()
        }

        Log.d(TAG, "WAV file saved: ${wavFile.absolutePath}, size: ${wavFile.length()}")
        tempPcmFile.delete()

     } catch (e: Exception) {
        Log.e(TAG, " Failed to save WAV: ${e.message}", e)
    }
  }

private fun buildWavHeader(pcmSize: Long): ByteArray {
    val numChannels = 1 
    val bitsPerSample = 16 
    val byteDepth = bitsPerSample / 8
    val byteRate = sampleRate * numChannels * byteDepth
    val totalSize = pcmSize + 36

    return ByteArray(44).apply {
        // "RIFF"
        this[0] = 'R'.code.toByte(); this[1] = 'I'.code.toByte()
        this[2] = 'F'.code.toByte(); this[3] = 'F'.code.toByte()
        putIntLE(4, totalSize.toInt())

        // "WAVE"
        this[8] = 'W'.code.toByte(); this[9] = 'A'.code.toByte()
        this[10] = 'V'.code.toByte(); this[11] = 'E'.code.toByte()

        // "fmt "
        this[12] = 'f'.code.toByte(); this[13] = 'm'.code.toByte()
        this[14] = 't'.code.toByte(); this[15] = ' '.code.toByte()
        putIntLE(16, 16) // PCM chunk size
        putShortLE(20, 1) // PCM format
        putShortLE(22, numChannels.toShort())
        putIntLE(24, sampleRate)
        putIntLE(28, byteRate)
        putShortLE(32, (numChannels * byteDepth).toShort())
        putShortLE(34, bitsPerSample.toShort())

        // "data"
        this[36] = 'd'.code.toByte(); this[37] = 'a'.code.toByte()
        this[38] = 't'.code.toByte(); this[39] = 'a'.code.toByte()
        putIntLE(40, pcmSize.toInt())
    }
}

private fun ByteArray.putIntLE(offset: Int, value: Int) {
    this[offset] = (value and 0xff).toByte()
    this[offset + 1] = ((value shr 8) and 0xff).toByte()
    this[offset + 2] = ((value shr 16) and 0xff).toByte()
    this[offset + 3] = ((value shr 24) and 0xff).toByte()
}

private fun ByteArray.putShortLE(offset: Int, value: Short) {
    this[offset] = (value.toInt() and 0xff).toByte()
    this[offset + 1] = ((value.toInt() shr 8) and 0xff).toByte()
}


    private fun sendEvent(name: String, params: WritableMap) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(name, params)
    }
}
