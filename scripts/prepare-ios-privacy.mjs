import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const appleProject = resolve("src-tauri/gen/apple");
const privacyManifest = resolve(appleProject, "PrivacyInfo.xcprivacy");

const content = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
    <key>NSPrivacyAccessedAPITypes</key>
    <array>
      <dict>
        <key>NSPrivacyAccessedAPIType</key>
        <string>NSPrivacyAccessedAPICategoryFileTimestamp</string>
        <key>NSPrivacyAccessedAPITypeReasons</key>
        <array>
          <string>C617.1</string>
        </array>
      </dict>
    </array>
  </dict>
</plist>
`;

await mkdir(appleProject, { recursive: true });
await writeFile(privacyManifest, content, "utf8");
console.log(`Wrote ${privacyManifest}`);
