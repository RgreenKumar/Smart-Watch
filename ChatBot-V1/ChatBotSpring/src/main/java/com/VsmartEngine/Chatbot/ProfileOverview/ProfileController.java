package com.VsmartEngine.Chatbot.ProfileOverview;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/profiles")
@CrossOrigin
public class ProfileController {

    private final ProfileRepository repository;

    public ProfileController(ProfileRepository repository) {
        this.repository = repository;
    }

    @PostMapping
    public ResponseEntity<?> createProfile(
            @RequestParam("name") String name,
            @RequestParam("status") String status,
            @RequestParam("url") String url,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "clearImage", required = false) Boolean clearImage
    ) {
        try {
            boolean statusValue = Boolean.parseBoolean(status);

            byte[] imageData = null;

            if (Boolean.TRUE.equals(clearImage)) {
                imageData = null;
            } else if (imageFile != null && !imageFile.isEmpty()) {
                imageData = imageFile.getBytes();
            }

            Profile profile = Profile.builder()
                    .name(name)
                    .status(statusValue)
                    .url(url)
                    .imageData(imageData)
                    .build();

            repository.deleteAll(); // single record
            Profile saved = repository.save(profile);

            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<Profile> getProfile() {
        return ResponseEntity.ok(
                repository.findAll().stream().findFirst().orElse(null)
        );
    }

    @GetMapping(value = "/image", produces = MediaType.IMAGE_JPEG_VALUE)
    public ResponseEntity<byte[]> getProfileImage() {
        Profile profile = repository.findAll().stream().findFirst().orElse(null);

        if (profile != null && profile.getImageData() != null) {
            return ResponseEntity.ok(profile.getImageData());
        }

        return ResponseEntity.noContent().build();
    }
}