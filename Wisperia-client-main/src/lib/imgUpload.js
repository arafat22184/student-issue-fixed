export const imageUpload = async (image) => {
    const formData = new FormData();
    
    formData.append("image", image);


    const res = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_KEY}`, {
        method: "POST",
        body: formData,
    });

    const data = await res.json();
    if (data.success) {
        return data.data.url;
    } else {
        throw new Error("Image upload failed");
    }
};