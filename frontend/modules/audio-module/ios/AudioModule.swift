import ExpoModulesCore
import AVFoundation

public class AudioModule: Module {
  // Each module class must implement the definition function. The definition consists of components
  // that describes the module's functionality and behavior.

  var audioEngine: AVAudioEngine?
  var fileHandle: FileHandle?
  var isRecording = false
  var tempPCMURL: URL?
  var wavFileURL: URL?
  let sampleRate: Double = 44100
  let numChannels: Int = 1
  let bitsPerSample: Int = 16
  var startTime: TimeInterval = 0

  // See https://docs.expo.dev/modules/module-api for more details about available components.
  public func definition() -> ModuleDefinition {
    // Sets the name of the module that JavaScript code will use to refer to the module. Takes a string as an argument.
    // Can be inferred from module's class name, but it's recommended to set it explicitly for clarity.
    // The module will be accessible from `requireNativeModule('AudioModule')` in JavaScript.
    Name("AudioModule")
    Events("onAudioWaveform", "recUpdate", "recStop")

    // Defines constant property on the module.
    Constant("PI") {
      Double.pi
    }

    // Defines event names that the module can send to JavaScript.
    Events("onChange")

    // Defines a JavaScript synchronous function that runs the native code on the JavaScript thread.
    Function("hello") {
      return "Hello world! 👋"
    }

    // Defines a JavaScript function that always returns a Promise and whose native code
    // is by default dispatched on the different thread than the JavaScript runtime runs on.
    AsyncFunction("setValueAsync") { (value: String) in
      // Send an event to JavaScript.
      self.sendEvent("onChange", [
        "value": value
      ])
    }

    // Start Recording Work

    AsyncFunction("startRecording") { (promise: Promise) in
      if self.isRecording {
        promise.reject("ALREADY_RECORDING", "Already recording", nil)
        return
      }

      do {
        try AVAudioSession.sharedInstance().setCategory(.record, mode: .default)
        try AVAudioSession.sharedInstance().setActive(true)
      } catch {
        promise.reject("SESSION_ERROR", "Audio session failed", error)
        return
      }

      self.audioEngine = AVAudioEngine()
      guard let engine = self.audioEngine else {
        promise.reject("ENGINE_ERROR", "Failed to start engine", nil)
        return
      }

      let id = UUID().uuidString
      let doc = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
      self.tempPCMURL = doc.appendingPathComponent("temp_\(id).pcm")
      self.wavFileURL = doc.appendingPathComponent("rec_\(id).wav")
      FileManager.default.createFile(atPath: self.tempPCMURL!.path, contents: nil)
      self.fileHandle = try? FileHandle(forWritingTo: self.tempPCMURL!)

      let input = engine.inputNode
      let format = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: self.sampleRate, channels: AVAudioChannelCount(self.numChannels), interleaved: true)!

      input.installTap(onBus: 0, bufferSize: 1024, format: format) { buffer, _ in
        guard let ch = buffer.int16ChannelData?[0] else { return }
        let frameCount = Int(buffer.frameLength)
        let data = Data(bytes: ch, count: frameCount * 2)
        self.fileHandle?.write(data)

        // RMS amplitude
        var sum: Double = 0
        for i in 0..<frameCount { sum += Double(ch[i]) * Double(ch[i]) }
        let rms = sqrt(sum / Double(frameCount))
        let normalized = rms / Double(Int16.max)
        self.sendEvent("onAudioWaveform", ["amplitude": normalized])
      }

      do {
        try engine.start()
        self.isRecording = true
        self.startTime = Date().timeIntervalSince1970
        promise.resolve(nil)
      } catch {
        promise.reject("START_ERROR", "Engine start failed", error)
      }
    }

    // Stop Recording Work
    AsyncFunction("stopRecording") { (promise: Promise) in
      guard self.isRecording else {
        promise.reject("NOT_RECORDING", "Not currently recording", nil)
        return
      }

      self.isRecording = false
      self.audioEngine?.stop()
      self.audioEngine?.inputNode.removeTap(onBus: 0)
      self.fileHandle?.closeFile()

      guard let pcm = self.tempPCMURL, let wav = self.wavFileURL else {
        promise.reject("FILE_ERROR", "File not found", nil)
        return
      }

      self.saveAsWav(pcmURL: pcm, wavURL: wav)
      self.sendEvent("recStop", ["filePath": wav.path])
      promise.resolve(["filePath": wav.path])
    }
  }


  // Helper function
   private func saveAsWav(pcmURL: URL, wavURL: URL) {
    guard let pcmData = try? Data(contentsOf: pcmURL) else { return }
    let header = buildWavHeader(pcmSize: pcmData.count)
    var wavData = Data()
    wavData.append(header)
    wavData.append(pcmData)
    try? wavData.write(to: wavURL)
    try? FileManager.default.removeItem(at: pcmURL)
  }

  private func buildWavHeader(pcmSize: Int) -> Data {
    let totalSize = pcmSize + 36
    let byteRate = Int(sampleRate) * numChannels * (bitsPerSample / 8)
    var header = Data()
    header.append("RIFF".data(using: .ascii)!)
    header.append(intToBytes(totalSize))
    header.append("WAVE".data(using: .ascii)!)
    header.append("fmt ".data(using: .ascii)!)
    header.append(intToBytes(16))
    header.append(shortToBytes(1))
    header.append(shortToBytes(Int16(numChannels)))
    header.append(intToBytes(Int(sampleRate)))
    header.append(intToBytes(byteRate))
    header.append(shortToBytes(Int16(numChannels * (bitsPerSample / 8))))
    header.append(shortToBytes(Int16(bitsPerSample)))
    header.append("data".data(using: .ascii)!)
    header.append(intToBytes(pcmSize))
    return header
  }

  private func intToBytes(_ val: Int) -> Data {
    var v = UInt32(val)
    return Data(bytes: &v, count: 4)
  }

  private func shortToBytes(_ val: Int16) -> Data {
    var v = val
    return Data(bytes: &v, count: 2)
  }

    // Enables the module to be used as a native view. Definition components that are accepted as part of the
    // view definition: Prop, Events.
    View(AudioModuleView.self) {
      // Defines a setter for the `url` prop.
      Prop("url") { (view: AudioModuleView, url: URL) in
        if view.webView.url != url {
          view.webView.load(URLRequest(url: url))
        }
      }

      Events("onLoad")
    }
  }
}
