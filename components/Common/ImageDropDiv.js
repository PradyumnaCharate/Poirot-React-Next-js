import React from "react";
import { Form, Segment, Image, Icon, Header } from "semantic-ui-react";

function ImageDropDiv({
  highlighted,
  setHighlighted,
  inputRef,
  handleChange,
  mediaPreview,
  setMediaPreview,
  setMedia
}) {
  return (
    <>
      <Form.Field>
        <Segment placeholder basic secondary>
          <input
            style={{ display: "none" }}
            type="file"
            accept="image/*"
            onChange={handleChange}
            name="media"
            ref={inputRef}
          />
            {//These are event listners whenever user grags an image it will be highlighted
            }
          <div
            onDragOver={e => {
              e.preventDefault();
              setHighlighted(true);
            }}
            onDragLeave={e => {
              e.preventDefault();
              setHighlighted(false);
            }}
            onDrop={e => {
              e.preventDefault();
              setHighlighted(true);
                   {//First we will convert image to an array and then extract image from it
                    //and to create preview we use this code
            }
              const droppedFile = Array.from(e.dataTransfer.files);
              setMedia(droppedFile[0]);
              setMediaPreview(URL.createObjectURL(droppedFile[0]));
            }}>
            {mediaPreview === null ? (
              <>
                <Segment {...(highlighted && {color:"green"})}  placeholder basic>
                  <Header icon>
                    <Icon
                      name="file image outline"
                      style={{ cursor: "pointer" }}
                      onClick={() => inputRef.current.click()}
                    />
                Click To Upload Profile Image or Drag and drop Image file
                  </Header>
                </Segment>
              </>
            ) : (
              <>
                <Segment color="green" placeholder basic>
                  <Image
                    src={mediaPreview}
                    size="medium"
                    centered
                    style={{ cursor: "pointer" }}
                    onClick={() => inputRef.current.click()}
                  />
                </Segment>
              </>
            )}
          </div>
        </Segment>
      </Form.Field>
    </>
  );
}

export default ImageDropDiv;
