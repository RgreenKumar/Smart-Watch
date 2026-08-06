package  com.KnowledgeVista.FileService;
import java.awt.Color;
import java.awt.Dimension;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import javax.imageio.ImageIO;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.apache.poi.hslf.usermodel.HSLFSlide;
import org.apache.poi.hslf.usermodel.HSLFSlideShow;
import org.apache.poi.xslf.usermodel.XMLSlideShow;
import org.apache.poi.xslf.usermodel.XSLFSlide;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.bind.annotation.RequestParam;

import  com.KnowledgeVista.Course.MiniatureDetail;
import  com.KnowledgeVista.ImageCompressing.ImageResizer;
@Service
public class PPTReader {
    @Value("${upload.video.directory}")
    private String videoUploadDirectory;
    
  	 private static final Logger logger = LoggerFactory.getLogger(PPTReader.class);

  
    public ResponseEntity<SlideResponse> getSlideImage( String fileName, int slideNumber) {
        try {
            String filePath = videoUploadDirectory + fileName;
            InputStream fis = new FileInputStream(filePath);
            SlideResponse slideResponse = null;
            int totalSlides;

            // Determine the file type based on extension
            if (fileName.toLowerCase().endsWith(".pptx")) {
                // Handle .pptx files
                XMLSlideShow ppt = new XMLSlideShow(fis);
                totalSlides = ppt.getSlides().size();

                // Validate slide number
                if (slideNumber < 1 || slideNumber > totalSlides) {
                	fis.close();
                	ppt.close();
                    return ResponseEntity.badRequest().body(null); // Invalid slide number
                }

                XSLFSlide slide = ppt.getSlides().get(slideNumber - 1);
                Dimension slideSize = ppt.getPageSize(); // Get the slide dimensions

                // Create a BufferedImage with the dimensions of the slide
                BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
                Graphics2D graphics = img.createGraphics();
                graphics.setPaint(Color.WHITE);
                graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
                slide.draw(graphics);

                // Encode image to Base64
                slideResponse = createSlideResponse(img,totalSlides);
                ppt.close();
            } else if (fileName.toLowerCase().endsWith(".ppt")) {
                // Handle .ppt files
                HSLFSlideShow ppt = new HSLFSlideShow(fis);
                totalSlides = ppt.getSlides().size();

                // Validate slide number
                if (slideNumber < 1 || slideNumber > totalSlides) {
                	fis.close();
                	ppt.close();
                    return ResponseEntity.badRequest().body(null); // Invalid slide number
                }

                HSLFSlide slide = ppt.getSlides().get(slideNumber - 1);
                Dimension slideSize = ppt.getPageSize(); // Set a default size for .ppt slides

                // Create a BufferedImage with the dimensions of the slide
                BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
                Graphics2D graphics = img.createGraphics();
                graphics.setPaint(Color.WHITE);
                graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
                slide.draw(graphics);

                // Encode image to Base64
                slideResponse = createSlideResponse(img,totalSlides);
                ppt.close();
            } else {
            	fis.close();
                return ResponseEntity.badRequest().body(null); // Unsupported file type
            }

            // Return the image and total slides count as a response
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(slideResponse);
        } catch (IOException e) {
            e.printStackTrace();    logger.error("", e);;
            return ResponseEntity.internalServerError().build();
        }
    }

    private SlideResponse createSlideResponse(BufferedImage img,int totalslides) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(img, "png", baos);
        byte[] imageBytes = baos.toByteArray();
        // Encode the image to Base64
        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        SlideResponse slide=new SlideResponse();
        slide.setImage(base64Image);
        slide.setTotalSlides(totalslides);
        return slide;
    }
    
    

    public ResponseEntity<SlideResponse> getPdfImage( String fileName, int pageNumber) {
        String filePath = videoUploadDirectory + fileName;
        try (PDDocument document = PDDocument.load(new File(filePath))) {
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            pageNumber = pageNumber - 1; // Adjust for zero-based indexing

            // Check if the page number is valid
            if (pageNumber < 0 || pageNumber >= document.getNumberOfPages()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
            }

            // Render the specified page to a BufferedImage
            BufferedImage bufferedImage = pdfRenderer.renderImageWithDPI(pageNumber, 300); // 300 DPI for quality

            // Get the width and height of the PDF page itself
            PDPage page = document.getPage(pageNumber);
            float pageWidth = page.getMediaBox().getWidth();
            float pageHeight = page.getMediaBox().getHeight();

            // Scale the image to match the original PDF page dimensions
            BufferedImage scaledImage = scaleImage(bufferedImage, (int) pageWidth, (int) pageHeight);

            // Convert BufferedImage to Base64
            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            ImageIO.write(scaledImage, "png", baos);
            String base64Image = Base64.getEncoder().encodeToString(baos.toByteArray());

            // Create SlideResponse with Base64 image and total slides
            SlideResponse response = new SlideResponse(base64Image, document.getNumberOfPages());
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            e.printStackTrace();    logger.error("", e);;
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    // Helper method to scale a BufferedImage
    private BufferedImage scaleImage(BufferedImage originalImage, int width, int height) {
        BufferedImage scaledImage = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g2d = scaledImage.createGraphics();
        g2d.drawImage(originalImage, 0, 0, width, height, null);
        g2d.dispose();
        return scaledImage;
    
    }
    
    //=========================FOR MINIATURE======================================
//    public List<MiniatureDetail> getMiniatures(@RequestParam String fileName) throws IOException {
//        String filePath = videoUploadDirectory + fileName;
//        InputStream fis = new FileInputStream(filePath);
//        List<MiniatureDetail> miniatureDetails = new ArrayList<>();
//
//        // Determine the file type based on the extension
//        if (fileName.toLowerCase().endsWith(".pptx")) {
//            // Handle .pptx files
//            XMLSlideShow ppt = new XMLSlideShow(fis);
//            int totalSlides = ppt.getSlides().size();
//
//            // Loop through each slide
//            for (int i = 0; i < totalSlides; i++) {
//                XSLFSlide slide = ppt.getSlides().get(i);
//                Dimension slideSize = ppt.getPageSize();
//
//                // Convert each slide to a BufferedImage
//                BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
//                Graphics2D graphics = img.createGraphics();
//                graphics.setPaint(Color.WHITE);
//                graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
//                slide.draw(graphics);
//
//                // Convert the BufferedImage to byte[]
//                byte[] imageBytes = convertImageToBytes(img);
//                byte[] resized= ImageResizer.resizeImage(imageBytes,100,100);
//                // Create MiniatureDetail and add it to the list
//                MiniatureDetail mini = new MiniatureDetail(resized, i + 1); // i+1 for page number
//                miniatureDetails.add(mini);
//            }
//            ppt.close();
//        } else if (fileName.toLowerCase().endsWith(".ppt")) {
//            // Handle .ppt files
//            HSLFSlideShow ppt = new HSLFSlideShow(fis);
//            int totalSlides = ppt.getSlides().size();
//
//            // Loop through each slide
//            for (int i = 0; i < totalSlides; i++) {
//                HSLFSlide slide = ppt.getSlides().get(i);
//                Dimension slideSize = ppt.getPageSize();
//
//                // Convert each slide to a BufferedImage
//                BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
//                Graphics2D graphics = img.createGraphics();
//                graphics.setPaint(Color.WHITE);
//                graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
//                slide.draw(graphics);
//
//                // Convert the BufferedImage to byte[]
//                byte[] imageBytes = convertImageToBytes(img);
//
//                byte[] resized= ImageResizer.resizeImage(imageBytes,100,100);
//                // Create MiniatureDetail and add it to the list
//                MiniatureDetail mini = new MiniatureDetail(resized, i + 1); // i+1 for page number
//                miniatureDetails.add(mini);
//            }
//            ppt.close();
//        }else if(fileName.toLowerCase().endsWith(".pdf")) {
//
//            PDDocument document = PDDocument.load(new File(filePath));
//                PDFRenderer pdfRenderer = new PDFRenderer(document);
//                int totalPages = document.getNumberOfPages();
//
//                // Loop through each page and convert it to an image
//                for (int pageNumber = 0; pageNumber < totalPages; pageNumber++) {
//                    // Render the specified page to a BufferedImage
//                    BufferedImage bufferedImage = pdfRenderer.renderImageWithDPI(pageNumber, 300); // 300 DPI for high quality
//
//                    // Get the width and height of the PDF page itself
//                    PDPage page = document.getPage(pageNumber);
//                    float pageWidth = page.getMediaBox().getWidth();
//                    float pageHeight = page.getMediaBox().getHeight();
//
//                    // Scale the image to match the original PDF page dimensions
//                    BufferedImage scaledImage = scaleImage(bufferedImage, (int) pageWidth, (int) pageHeight);
//
//                    // Convert BufferedImage to byte[]
//                    byte[] imageBytes = convertImageToBytes(scaledImage);
//                    byte[] resized= ImageResizer.resizeImage(imageBytes,100,100);
//                    MiniatureDetail mini = new MiniatureDetail(resized, pageNumber + 1); // pageNumber+1 for 1-based index
//                    miniatureDetails.add(mini);
//                }
//           
//
//           
//        
//        }
//        else {
//        
//        	fis.close();
//            throw new IllegalArgumentException("Unsupported file type");
//        }
//
//        fis.close();
//        return miniatureDetails; // Return the list of MiniatureDetail
//    }
//
//    // Helper method to convert BufferedImage to byte[]
//    private byte[] convertImageToBytes(BufferedImage image) throws IOException {
//        ByteArrayOutputStream baos = new ByteArrayOutputStream();
//        ImageIO.write(image, "jpeg", baos); // Write the BufferedImage to the output stream as JPEG
//        return baos.toByteArray();
//    }
//    
//    
//    
//    
//    }
    
    
    public List<MiniatureDetail> getMiniatures(@RequestParam String fileName) throws IOException {
        String filePath = videoUploadDirectory + fileName;
        List<MiniatureDetail> miniatureDetails = new ArrayList<>();

        try (InputStream fis = new FileInputStream(filePath)) {
            // Determine the file type based on the extension
            if (fileName.toLowerCase().endsWith(".pptx")) {
                // Handle .pptx files
                try (XMLSlideShow ppt = new XMLSlideShow(fis)) {
                    int totalSlides = ppt.getSlides().size();

                    // Loop through each slide
                    for (int i = 0; i < totalSlides; i++) {
                        XSLFSlide slide = ppt.getSlides().get(i);
                        Dimension slideSize = ppt.getPageSize();

                        // Convert each slide to a BufferedImage
                        BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
                        Graphics2D graphics = img.createGraphics();
                        graphics.setPaint(Color.WHITE);
                        graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
                        slide.draw(graphics);

                        // Convert the BufferedImage to byte[]
                        byte[] imageBytes = convertImageToBytes(img);
                        byte[] resized = ImageResizer.resizeImage(imageBytes, 100, 100);

                        // Create MiniatureDetail and add it to the list
                        MiniatureDetail mini = new MiniatureDetail(resized, i + 1); // i+1 for page number
                        miniatureDetails.add(mini);
                    }
                }
            } else if (fileName.toLowerCase().endsWith(".ppt")) {
                // Handle .ppt files
                try (HSLFSlideShow ppt = new HSLFSlideShow(fis)) {
                    int totalSlides = ppt.getSlides().size();

                    // Loop through each slide
                    for (int i = 0; i < totalSlides; i++) {
                        HSLFSlide slide = ppt.getSlides().get(i);
                        Dimension slideSize = ppt.getPageSize();

                        // Convert each slide to a BufferedImage
                        BufferedImage img = new BufferedImage(slideSize.width, slideSize.height, BufferedImage.TYPE_INT_RGB);
                        Graphics2D graphics = img.createGraphics();
                        graphics.setPaint(Color.WHITE);
                        graphics.fillRect(0, 0, img.getWidth(), img.getHeight());
                        slide.draw(graphics);

                        // Convert the BufferedImage to byte[]
                        byte[] imageBytes = convertImageToBytes(img);
                        byte[] resized = ImageResizer.resizeImage(imageBytes, 100, 100);

                        // Create MiniatureDetail and add it to the list
                        MiniatureDetail mini = new MiniatureDetail(resized, i + 1); // i+1 for page number
                        miniatureDetails.add(mini);
                    }
                }
            } else if (fileName.toLowerCase().endsWith(".pdf")) {
                // Handle .pdf files
                try (PDDocument document = PDDocument.load(new File(filePath))) {
                    PDFRenderer pdfRenderer = new PDFRenderer(document);
                    int totalPages = document.getNumberOfPages();

                    // Loop through each page and convert it to an image
                    for (int pageNumber = 0; pageNumber < totalPages; pageNumber++) {
                        // Render the specified page to a BufferedImage
                        BufferedImage bufferedImage = pdfRenderer.renderImageWithDPI(pageNumber, 300); // 300 DPI for high quality

                        // Get the width and height of the PDF page itself
                        PDPage page = document.getPage(pageNumber);
                        float pageWidth = page.getMediaBox().getWidth();
                        float pageHeight = page.getMediaBox().getHeight();

                        // Scale the image to match the original PDF page dimensions
                        BufferedImage scaledImage = scaleImage(bufferedImage, (int) pageWidth, (int) pageHeight);

                        // Convert BufferedImage to byte[]
                        byte[] imageBytes = convertImageToBytes(scaledImage);
                        byte[] resized = ImageResizer.resizeImage(imageBytes, 100, 100);

                        MiniatureDetail mini = new MiniatureDetail(resized, pageNumber + 1); // pageNumber+1 for 1-based index
                        miniatureDetails.add(mini);
                    }
                }
            } else {
                throw new IllegalArgumentException("Unsupported file type");
            }
        }

        return miniatureDetails; // Return the list of MiniatureDetail
    }

    // Helper method to convert BufferedImage to byte[]
    private byte[] convertImageToBytes(BufferedImage image) throws IOException {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "jpeg", baos); // Write the BufferedImage to the output stream as JPEG
        return baos.toByteArray();
    }
}


