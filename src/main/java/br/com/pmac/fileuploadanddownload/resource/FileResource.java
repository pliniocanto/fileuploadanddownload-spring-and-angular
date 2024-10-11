package br.com.pmac.fileuploadanddownload.resource;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@RestController
@RequestMapping("/file")
public class FileResource {

    // define a location
    public static final String DIRECTORY = System.getProperty("user.home") + "/Downloads/uploads/";

    // define method to upload file
    @PostMapping("/upload")
    public ResponseEntity<List<String>> uploadFiles(@RequestParam("files") List<MultipartFile> multipartFiles)
            throws IOException {

        List<String> fileNames = new ArrayList<>();

        for (MultipartFile file : multipartFiles) {
            String fileName = file.getOriginalFilename();
            // define a location
            Path falieStorage = new File(DIRECTORY + fileName).toPath().normalize();
            // save file
            Files.copy(file.getInputStream(), falieStorage, StandardCopyOption.REPLACE_EXISTING);
            fileNames.add(fileName);
        }

        return ResponseEntity.ok().body(fileNames);
    }

    // define method to download file
    @GetMapping("/download/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable("filename") String fileName) throws IOException {

        Path path = new File(DIRECTORY + fileName).toPath().normalize();
        if (!Files.exists(path)) {
            throw new FileNotFoundException(fileName + " was not found");
        }

        Resource resource = new UrlResource(path.toUri());
        HttpHeaders httpHeaders = new HttpHeaders();
        httpHeaders.add("File-Name", fileName);
        httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment;File-Name=" + resource.getFilename());

        return ResponseEntity.ok().contentType(MediaType.parseMediaType(Files.probeContentType(path)))
                .headers(httpHeaders).body(resource);

    }

}
