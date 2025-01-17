import contentHash from "content-hash";
import { ethers } from "ethers";
const supportedCodecs = [
  "ipns-ns",
  "ipfs-ns",
  "skynet-ns",
  "swarm-ns",
  "onion",
  "onion3",
];

const utils = ethers.utils;

export function decodeContenthash(encoded) {
  let decoded, protocolType, error;
  if (encoded.error) {
    return { protocolType: null, decoded: encoded.error };
  }
  if (encoded) {
    try {
      decoded = contentHash.decode(encoded);

      var codec = contentHash.getCodec(encoded);

      if (codec === "ipfs-ns") {
        protocolType = "ipfs";
      } else if (codec === "ipns-ns") {
        protocolType = "ipns";
      } else if (codec === "swarm-ns") {
        protocolType = "bzz";
      } else if (codec === "onion") {
        protocolType = "onion";
      } else if (codec === "onion3") {
        protocolType = "onion3";
      } else if (codec === "skynet-ns") {
        protocolType = "sia";
      } else if (codec === "arweave-ns") {
        protocolType = "arweave";
      } else {
        decoded = encoded;
      }
    } catch (e) {
      error = e.message;
    }
  }
  return { protocolType, decoded, error };
}

export function validateContent(encoded) {
  return (
    contentHash.isHashOfType(encoded, contentHash.Types.ipfs) ||
    contentHash.isHashOfType(encoded, contentHash.Types.swarm)
  );
}

export function isValidContenthash(encoded) {
  try {
    const codec = contentHash.getCodec(encoded);
    return utils.isHexString(encoded) && supportedCodecs.includes(codec);
  } catch (e) {
    console.log(e);
  }
}

export function encodeContenthash(text) {
  let content, contentType;
  let encoded = false;
  if (!!text) {
    let matched =
      text.match(/^(ipfs|sia|ipns|bzz|onion|onion3):\/\/(.*)/) ||
      text.match(/\/(ipfs)\/(.*)/) ||
      text.match(/\/(ipns)\/(.*)/);
    if (matched) {
      contentType = matched[1];
      content = matched[2];
    }

    try {
      if (contentType === "ipfs") {
        if (content.length >= 4) {
          encoded = "0x" + _contentHash["default"].encode("ipfs-ns", content);
        }
      } else if (contentType === "ipns") {
        encoded = "0x" + _contentHash["default"].encode("ipns-ns", content);
      } else if (contentType === "bzz") {
        if (content.length >= 4) {
          encoded = "0x" + _contentHash["default"].fromSwarm(content);
        }
      } else if (contentType === "onion") {
        if (content.length == 16) {
          encoded = "0x" + _contentHash["default"].encode("onion", content);
        }
      } else if (contentType === "onion3") {
        if (content.length == 56) {
          encoded = "0x" + _contentHash["default"].encode("onion3", content);
        }
      } else if (contentType === "sia") {
        if (content.length == 46) {
          encoded = "0x" + _contentHash["default"].encode("skynet-ns", content);
        }
      } else if (contentType === "arweave") {
        if (content.length == 43) {
          encoded =
            "0x" + _contentHash["default"].encode("arweave-ns", content);
        }
      } else {
        console.warn("Unsupported protocol or invalid value", {
          contentType: contentType,
          text: text,
        });
      }
    } catch (err) {
      console.warn("Error encoding content hash", {
        text: text,
        encoded: encoded,
      });
    }
  }
  return encoded;
}
