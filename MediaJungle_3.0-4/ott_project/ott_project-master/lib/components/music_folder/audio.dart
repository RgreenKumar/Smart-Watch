class Audio {
  final int id;
  final int? userId;
  final String thumbnail;
  final String fileName;
  final String songname;
  //final int categoryId;
  final String categoryName;
  //bool isLiked;
  Audio({
    required this.id,
    required this.thumbnail,
    required this.fileName,
    required this.songname,
    // required this.categoryId,
    required this.categoryName,
    this.userId,
    // this.isLiked = false,
  });

  factory Audio.fromJson(Map<String, dynamic> json) {
    //print('Audio JSON :$json ');
    String catName = '';
    if (json['category'] is Map) {
      catName = json['category']['categories'] ?? '';
    } else if (json['categories'] != null) {
      catName = json['categories'].toString();
    }
    return Audio(
      id: json['id'],
      thumbnail: json['thumbnail'] ?? '',
      fileName: json['fileName'] ?? json['audio_file_name'] ?? '',
      songname: json['audioTitle'] ?? '',
      userId: json['userId'],
      categoryName: catName,
    );
  }
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'thumbnail': thumbnail,
      'fileName': fileName,
      'songname': songname,
      // 'categoryId': categoryId,
      'userId': userId,
      'categoryName': categoryName
    };
  }

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Audio && runtimeType == other.runtimeType && id == other.id;

  @override
  int get hashCode => id.hashCode ^ songname.hashCode;
  //  ^ categoryId.hashCode;

  @override
  String toString() {
    return 'Audio{id: $id, songname: $songname}';
    //  categoryId: $categoryId}';
  }
}
