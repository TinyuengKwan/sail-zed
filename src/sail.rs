use zed_extension_api as zed;

struct SailExtension;

impl zed::Extension for SailExtension {
    fn new() -> Self {
        Self
    }
}

zed::register_extension!(SailExtension);
