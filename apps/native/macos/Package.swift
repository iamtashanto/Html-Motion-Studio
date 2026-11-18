// swift-tools-version: 6.0
import PackageDescription
import Foundation

let packageDir = URL(fileURLWithPath: #filePath).deletingLastPathComponent().path
let rustLibDir = "\(packageDir)/../target/release"

let package = Package(
    name: "HTMLMotionStudioMac",
    platforms: [
        .macOS(.v14)
    ],
    products: [
        .executable(name: "HTMLMotionStudioMac", targets: ["HTMLMotionStudioMac"])
    ],
    targets: [
        .target(
            name: "CHMSCore",
            path: "Sources/CHMSCore",
            publicHeadersPath: "include"
        ),
        .executableTarget(
            name: "HTMLMotionStudioMac",
            dependencies: ["CHMSCore"],
            path: "Sources/HTMLMotionStudioMac",
            linkerSettings: [
                .unsafeFlags(["-L\(rustLibDir)"]),
                .linkedLibrary("hms_ffi"),
                .linkedFramework("AppKit"),
                .linkedFramework("WebKit"),
                .linkedFramework("AVFoundation"),
                .linkedFramework("UniformTypeIdentifiers"),
                .linkedFramework("Security"),
                .linkedFramework("SystemConfiguration"),
                .linkedLibrary("z"),
                .linkedLibrary("iconv"),
            ]
        )
    ]
)
