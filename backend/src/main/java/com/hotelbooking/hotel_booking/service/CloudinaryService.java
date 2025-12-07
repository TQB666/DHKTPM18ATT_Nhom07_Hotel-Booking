package com.hotelbooking.hotel_booking.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class CloudinaryService {

    private final Cloudinary cloudinary;

    /**
     * Upload file ảnh lên Cloudinary
     *
     * @param file File ảnh cần upload
     * @param folder Thư mục trên Cloudinary (ví dụ: "avatars", "hotels")
     * @return URL của ảnh đã upload
     * @throws IOException nếu có lỗi khi upload
     */
    public String uploadImage(MultipartFile file, String folder) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File không được rỗng");
        }

        // Validate file type
        if (!isValidImageType(file.getContentType())) {
            throw new IllegalArgumentException("File phải là hình ảnh (jpg, png, gif, webp)");
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Kích thước file không được vượt quá 5MB");
        }

        try {
            String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            String folderPath = "hotel_booking/" + folder;

            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "public_id", folderPath + "/" + fileName,
                            "resource_type", "auto",
                            "quality", "auto",
                            "fetch_format", "auto"
                    )
            );

            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            log.error("Lỗi khi upload ảnh lên Cloudinary: ", e);
            throw new IOException("Lỗi khi upload ảnh: " + e.getMessage());
        }
    }

    /**
     * Xóa ảnh từ Cloudinary
     *
     * @param publicId Public ID của ảnh trên Cloudinary
     * @throws IOException nếu có lỗi khi xóa
     */
    public void deleteImage(String publicId) throws IOException {
        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
            log.info("Xóa ảnh thành công: " + publicId);
        } catch (IOException e) {
            log.error("Lỗi khi xóa ảnh từ Cloudinary: ", e);
            throw new IOException("Lỗi khi xóa ảnh: " + e.getMessage());
        }
    }

    /**
     * Kiểm tra xem file có phải hình ảnh không
     */
    private boolean isValidImageType(String contentType) {
        return contentType != null && (
                contentType.equals("image/jpeg") ||
                        contentType.equals("image/png") ||
                        contentType.equals("image/gif") ||
                        contentType.equals("image/webp")
        );
    }
}
