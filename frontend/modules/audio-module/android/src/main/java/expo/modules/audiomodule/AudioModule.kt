package expo.modules.audiomodule

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.net.URL

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

import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import kotlin.concurrent.thread

class AudioModule : Module() {


  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.
  // See https://docs.expo.dev/modules/module-api for more details about available components.


  private var isRecording = false
  private var audioRecord: AudioRecord? = null
  private val sampleRate = 44100
  private val bufferSize = AudioRecord.getMinBufferSize(
    sampleRate,
    AudioFormat.CHANNEL_IN_MONO,
    AudioFormat.ENCODING_PCM_16BIT
  ) * 2

  private lateinit var tempPcmFile: File
  private lateinit var wavFile: File
  private var startTime: Long = 0L

  override fun definition() = ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AudioModule')` in JavaScript.
    Name("AudioModule")
    Events("onAudioWaveform", "recUpdate", "recStop")

    // Defines constant property on the module.
    Constant("PI") {
      Math.PI
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      "Hello world! 👋"
    }

   // Start Recording Work
    Function("startRecording") {
      if (isRecording) return@Function null
      val ctx = appContext.reactContext ?: return@Function null

      val externalDir = ctx.getExternalFilesDir(Environment.DIRECTORY_MUSIC)
      val id = System.currentTimeMillis().toString()
      tempPcmFile = File(externalDir, "temp_$id.pcm")
      wavFile = File(externalDir, "rec_$id.wav")

      audioRecord = AudioRecord(
        MediaRecorder.AudioSource.MIC,
        sampleRate,
        AudioFormat.CHANNEL_IN_MONO,
        AudioFormat.ENCODING_PCM_16BIT,
        bufferSize
      )

      if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
        Log.e("AudioModule", "AudioRecord init failed")
        return@Function null
      }

      isRecording = true
      startTime = SystemClock.elapsedRealtime()
      audioRecord?.startRecording()

      thread {
        try {
          FileOutputStream(tempPcmFile).use { out ->
            val shortBuf = ShortArray(bufferSize / 2)
            while (isRecording) {
              val read = audioRecord!!.read(shortBuf, 0, shortBuf.size)
              if (read > 0) {
                val byteBuf = ByteBuffer.allocate(read * 2)
                  .order(ByteOrder.LITTLE_ENDIAN)
                byteBuf.asShortBuffer().put(shortBuf, 0, read)
                out.write(byteBuf.array())

                // Send live amplitude to JS
                val rms = shortBuf.take(read).map { it * it }.average()
                val normalized = Math.sqrt(rms) / Short.MAX_VALUE
                sendEvent("onAudioWaveform", mapOf("amplitude" to normalized))
              }

              val elapsed = SystemClock.elapsedRealtime() - startTime
              sendEvent("recUpdate", mapOf("elapsedMs" to elapsed))
              Thread.sleep(100)
            }
          }
          saveAsWav()
          sendEvent("recStop", mapOf("filePath" to wavFile.absolutePath))
        } catch (e: Exception) {
          Log.e("AudioModule", "Record error", e)
        }
      }
    }

    // Stop Recording Work
    Function("stopRecording") {
      if (!isRecording) return@Function null
      isRecording = false
      audioRecord?.apply {
        stop()
        release()
      }
      audioRecord = null
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { value: String ->
      // Send an event to JavaScript.
      sendEvent("onChange", mapOf(
        "value" to value
      ))
       return@AsyncFunction null
    }

    // Enables the module to be used as a native view. Definition components that are accepted as part of
    // the view definition: Prop, Events.
    View(AudioModuleView::class) {
      // Defines a setter for the `url` prop.
      Prop("url") { view: AudioModuleView, url: URL ->
        view.webView.loadUrl(url.toString())
      }
      // Defines an event that the view can send to JavaScript.
      Events("onLoad")
    }
  }

    private fun saveAsWav() {
    try {
      val pcmSize = tempPcmFile.length()
      val header = buildWavHeader(pcmSize)
      FileOutputStream(wavFile).use { wavOut ->
        wavOut.write(header)
        FileInputStream(tempPcmFile).copyTo(wavOut)
      }
      tempPcmFile.delete()
    } catch (e: Exception) {
      Log.e("AudioModule", "Save WAV failed", e)
    }
  }

  private fun buildWavHeader(pcmSize: Long): ByteArray {
    val channels = 1
    val bits = 16
    val byteRate = sampleRate * channels * (bits / 8)
    val total = pcmSize + 36
    return ByteArray(44).apply {
      putAscii(0, "RIFF")
      putIntLE(4, total.toInt())
      putAscii(8, "WAVEfmt ")
      putIntLE(16, 16)
      putShortLE(20, 1)
      putShortLE(22, channels.toShort())
      putIntLE(24, sampleRate)
      putIntLE(28, byteRate)
      putShortLE(32, (channels * (bits / 8)).toShort())
      putShortLE(34, bits.toShort())
      putAscii(36, "data")
      putIntLE(40, pcmSize.toInt())
    }
  }

  private fun ByteArray.putAscii(off: Int, v: String) {
    v.toByteArray().forEachIndexed { i, b -> this[off + i] = b }
  }
  private fun ByteArray.putIntLE(off: Int, v: Int) {
    this[off] = (v and 0xFF).toByte()
    this[off + 1] = ((v shr 8) and 0xFF).toByte()
    this[off + 2] = ((v shr 16) and 0xFF).toByte()
    this[off + 3] = ((v shr 24) and 0xFF).toByte()
  }
  private fun ByteArray.putShortLE(off: Int, v: Short) {
    this[off] = (v.toInt() and 0xFF).toByte()
    this[off + 1] = ((v.toInt() shr 8) and 0xFF).toByte()
  }
}


