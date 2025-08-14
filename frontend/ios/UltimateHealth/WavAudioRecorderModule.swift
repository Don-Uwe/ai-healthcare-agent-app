import Foundation
import AVFoundation
import React

@objc(WavAudioRecorder)
class WavAudioRecorder: RCTEventEmitter {

  private var audioEngine: AVAudioEngine?
  private var fileHandle: FileHandle?
  private var isRecording = false
  private var startTime: TimeInterval = 0
  private var tempPCMURL: URL?
  private var wavFileURL: URL?
  
  private let sampleRate: Double = 44100
  private let numChannels: Int = 1
  private let bitsPerSample: Int = 16
  
  override static func moduleName() -> String! {
    return "WavAudioRecorder"
  }
  
  override func constantsToExport() -> [AnyHashable : Any]! {
    return ["onAudioWaveform": "onAudioWaveform"]
  }
  
  override func supportedEvents() -> [String]! {
    return ["onAudioWaveform", "recUpdate", "recStop"]
  }
  
  @objc
  func startRecording(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    if isRecording {
      reject("ALREADY_RECORDING", "Recording is already in progress", nil)
      return
    }
    
    let session = AVAudioSession.sharedInstance()
    do {
      try session.setCategory(.record, mode: .default, options: [])
      try session.setActive(true)
    } catch {
      reject("AUDIO_SESSION_ERROR", "Failed to set up audio session", error)
      return
    }
    
    audioEngine = AVAudioEngine()
    guard let engine = audioEngine else {
      reject("ENGINE_ERROR", "Failed to create AVAudioEngine", nil)
      return
    }
    
    // File paths
    let uniqueId = "\(Int(Date().timeIntervalSince1970))_\(UUID().uuidString)"
    let musicDir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
    tempPCMURL = musicDir.appendingPathComponent("temp_recording_\(uniqueId).pcm")
    wavFileURL = musicDir.appendingPathComponent("recorded_audio_\(uniqueId).wav")
    
    FileManager.default.createFile(atPath: tempPCMURL!.path, contents: nil)
    
    do {
      fileHandle = try FileHandle(forWritingTo: tempPCMURL!)
    } catch {
      reject("FILE_ERROR", "Unable to create PCM file", error)
      return
    }
    
    let inputNode = engine.inputNode
    let format = AVAudioFormat(commonFormat: .pcmFormatInt16, sampleRate: sampleRate, channels: AVAudioChannelCount(numChannels), interleaved: true)!
    
    inputNode.installTap(onBus: 0, bufferSize: 1024, format: format) { [weak self] buffer, time in
      guard let strongSelf = self else { return }
      
      let channelData = buffer.int16ChannelData![0]
      let frameCount = Int(buffer.frameLength)
      
      // Write raw PCM
      let data = Data(bytes: channelData, count: frameCount * 2)
      strongSelf.fileHandle?.write(data)
      
      // Calculate RMS amplitude
      var sum: Double = 0
      for i in 0..<frameCount {
        let sample = Double(channelData[i])
        sum += sample * sample
      }
      let rms = sqrt(sum / Double(frameCount))
      let normalized = rms / Double(Int16.max)
      
      strongSelf.sendEvent(withName: "onAudioWaveform", body: ["amplitude": normalized])
      
      let elapsed = (Date().timeIntervalSince1970 - strongSelf.startTime) * 1000
      strongSelf.sendEvent(withName: "recUpdate", body: ["elapsedMs": elapsed])
    }
    
    do {
      try engine.start()
      isRecording = true
      startTime = Date().timeIntervalSince1970
      resolve(nil)
    } catch {
      reject("ENGINE_START_ERROR", "Failed to start recording", error)
    }
  }
  
  @objc
  func stopRecording(_ resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
    guard isRecording else {
      reject("NOT_RECORDING", "No active recording", nil)
      return
    }
    
    isRecording = false
    audioEngine?.stop()
    audioEngine?.inputNode.removeTap(onBus: 0)
    fileHandle?.closeFile()
    
    if let pcmURL = tempPCMURL, let wavURL = wavFileURL {
      saveAsWav(pcmURL: pcmURL, wavURL: wavURL)
      sendEvent(withName: "recStop", body: ["filePath": wavURL.path])
      resolve(["filePath": wavURL.path])
    } else {
      reject("FILE_MISSING", "Recording files not found", nil)
    }
  }
  
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
    header.append(shortToBytes(1)) // PCM format
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
}
