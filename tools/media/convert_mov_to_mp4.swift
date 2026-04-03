import AVFoundation
import Foundation

enum ConvertError: Error, CustomStringConvertible {
    case invalidArguments
    case exportSessionUnavailable
    case unsupportedOutputType

    var description: String {
        switch self {
        case .invalidArguments:
            return "usage: swift convert_mov_to_mp4.swift <input.mov> <output.mp4>"
        case .exportSessionUnavailable:
            return "failed to create AVAssetExportSession"
        case .unsupportedOutputType:
            return "mp4 output is not supported for this source"
        }
    }
}

func run() async throws {
    let args = CommandLine.arguments
    guard args.count == 3 else {
        throw ConvertError.invalidArguments
    }

    let inputURL = URL(fileURLWithPath: args[1])
    let outputURL = URL(fileURLWithPath: args[2])
    let asset = AVURLAsset(url: inputURL)

    guard let exportSession = AVAssetExportSession(asset: asset, presetName: AVAssetExportPresetHighestQuality) else {
        throw ConvertError.exportSessionUnavailable
    }

    guard exportSession.supportedFileTypes.contains(.mp4) else {
        throw ConvertError.unsupportedOutputType
    }

    if FileManager.default.fileExists(atPath: outputURL.path) {
        try FileManager.default.removeItem(at: outputURL)
    }

    exportSession.outputURL = outputURL
    exportSession.outputFileType = .mp4
    exportSession.shouldOptimizeForNetworkUse = true

    await exportSession.export()

    if let error = exportSession.error {
        throw error
    }

    guard exportSession.status == .completed else {
        throw NSError(domain: "ConvertMOVToMP4", code: 1, userInfo: [
            NSLocalizedDescriptionKey: "export ended with status \(exportSession.status.rawValue)"
        ])
    }
}

Task {
    do {
        try await run()
        exit(EXIT_SUCCESS)
    } catch {
        fputs("\(error)\n", stderr)
        exit(EXIT_FAILURE)
    }
}

dispatchMain()
